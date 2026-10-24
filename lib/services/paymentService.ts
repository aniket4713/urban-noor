/**
 * RAZORPAY PAYMENT FLOW
 * ---------------------
 * 1. Browser → POST /api/payments/create-order with cart items + customer + address.
 *    We recalculate the total from the DB, save a PENDING order, and create a Razorpay Order
 *    for that exact amount (in paise). We return { razorpayOrderId, amount, key } to the browser.
 * 2. Browser opens Razorpay Checkout with that order id. Customer pays (UPI/card/netbanking...).
 * 3. Razorpay returns { razorpay_order_id, razorpay_payment_id, razorpay_signature } to the browser,
 *    which POSTs them to /api/payments/verify.
 * 4. We recompute HMAC_SHA256(order_id|payment_id, KEY_SECRET) and compare to the signature.
 *    Only if it matches do we mark the order PAID and reduce stock.
 * 5. Razorpay ALSO calls our webhook (/api/payments/webhook) server-to-server. This is the
 *    safety net if the customer closes the browser before step 3. markPaid() is idempotent,
 *    so whichever of (verify, webhook) arrives first does the work.
 */
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { razorpay, verifyCheckoutSignature, verifyWebhookSignature } from "@/lib/razorpay";
import { checkoutSchema, verifyPaymentSchema } from "@/lib/validators";
import { orderService } from "./orderService";

export const paymentService = {
  async createOrder(input: z.infer<typeof checkoutSchema>, userId: string | null) {
    const rzp = razorpay(); // fails fast with a clear message if keys are missing (before saving an order)
    const order = await orderService.createPending(input, userId);

    const rzpOrder = await rzp.orders.create({
      amount: order.total * 100, // rupees → paise
      currency: "INR",
      receipt: order.orderNumber,
      notes: { orderNumber: order.orderNumber, email: order.email },
    });

    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { razorpayOrderId: rzpOrder.id } }),
      prisma.payment.create({
        data: { orderId: order.id, razorpayOrderId: rzpOrder.id, amount: Number(rzpOrder.amount), status: "CREATED" },
      }),
    ]);

    return {
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: Number(rzpOrder.amount),
      currency: "INR",
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      customer: { name: order.customerName, email: order.email, contact: order.phone },
      totals: { subtotal: order.subtotal, shippingFee: order.shippingFee, discount: order.discount, total: order.total },
    };
  },

  async verify(input: z.infer<typeof verifyPaymentSchema>) {
    const valid = verifyCheckoutSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature);
    if (!valid) {
      await orderService.markPaymentFailed(input.razorpay_order_id, input.razorpay_payment_id, "Signature mismatch");
      throw new ApiError(400, "Payment verification failed. If money was deducted, it will be refunded automatically.");
    }
    const order = await orderService.markPaid({
      razorpayOrderId: input.razorpay_order_id,
      razorpayPaymentId: input.razorpay_payment_id,
      signature: input.razorpay_signature,
    });
    return { orderNumber: order.orderNumber };
  },

  /** Handles Razorpay webhooks. `rawBody` must be the exact text Razorpay sent. */
  async handleWebhook(rawBody: string, signature: string | null) {
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      throw new ApiError(400, "Invalid webhook signature");
    }
    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: { payment?: { entity?: { id: string; order_id: string; amount: number; method?: string; error_description?: string } } };
    };
    const payment = event.payload?.payment?.entity;
    if (!payment?.order_id) return { ignored: true };

    if (event.event === "payment.captured" || event.event === "order.paid") {
      try {
        await orderService.markPaid({
          razorpayOrderId: payment.order_id,
          razorpayPaymentId: payment.id,
          method: payment.method,
          amount: payment.amount,
        });
      } catch (err) {
        // Not one of our orders (e.g. payment from another app on the same account) → acknowledge
        if (err instanceof ApiError && err.status === 404) return { ignored: true };
        throw err;
      }
    } else if (event.event === "payment.failed") {
      await orderService.markPaymentFailed(payment.order_id, payment.id, payment.error_description);
    }
    return { ok: true };
  },
};
