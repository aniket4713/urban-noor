import crypto from "crypto";
import { z } from "zod";
import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { checkoutSchema, orderUpdateSchema } from "@/lib/validators";
import { productService } from "./productService";
import { settingsService } from "./settingsService";
import { couponService, computeDiscount } from "./couponService";
import { emailService } from "./emailService";

const fullOrderInclude = { items: true } satisfies Prisma.OrderInclude;

function newOrderNumber() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase().slice(0, 5);
  return `UN${ymd}${rand}`;
}

export const orderService = {
  /**
   * Calculates the order total ON THE SERVER from database prices.
   * Never trust prices coming from the browser.
   */
  async quote(items: { productId: string; quantity: number }[], couponCode?: string) {
    if (!items.length) throw new ApiError(400, "Your cart is empty");
    // run the independent lookups in parallel → one database round trip instead of three
    const [products, settings, coupon] = await Promise.all([
      productService.findForCheckout(items.map((i) => i.productId)),
      settingsService.get(),
      couponCode ? couponService.findValid(couponCode) : Promise.resolve(null),
    ]);
    const map = new Map(products.map((p) => [p.id, p]));

    const lines = items.map((i) => {
      const p = map.get(i.productId);
      if (!p || !p.isActive) throw new ApiError(400, "One of the items in your cart is no longer available");
      if (p.stock < i.quantity) {
        throw new ApiError(400, p.stock === 0 ? `${p.name} is out of stock` : `Only ${p.stock} left of ${p.name}`);
      }
      return { productId: p.id, name: p.name, image: p.images[0]?.url ?? null, price: p.price, quantity: i.quantity };
    });

    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;

    let discount = 0;
    let appliedCoupon: string | null = null;
    if (coupon) {
      discount = computeDiscount(coupon, subtotal);
      appliedCoupon = coupon.code;
    }
    const total = Math.max(subtotal + shippingFee - discount, 1);
    return { lines, subtotal, shippingFee, discount, total, couponCode: appliedCoupon };
  },

  /** Saves a PENDING order. Payment is attached later by paymentService. */
  async createPending(input: z.infer<typeof checkoutSchema>, userId: string | null) {
    const q = await this.quote(input.items, input.couponCode || undefined);
    const order = await prisma.order.create({
      data: {
        orderNumber: newOrderNumber(),
        userId,
        customerName: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
        shipName: input.address.name,
        shipPhone: input.address.phone,
        line1: input.address.line1,
        line2: input.address.line2 || null,
        city: input.address.city,
        state: input.address.state,
        pincode: input.address.pincode,
        subtotal: q.subtotal,
        shippingFee: q.shippingFee,
        discount: q.discount,
        total: q.total,
        couponCode: q.couponCode,
        items: { create: q.lines },
      },
    });

    if (userId && input.saveAddress) {
      const exists = await prisma.address.findFirst({
        where: { userId, line1: input.address.line1, pincode: input.address.pincode },
      });
      if (!exists) {
        const count = await prisma.address.count({ where: { userId } });
        await prisma.address.create({
          data: { ...input.address, line2: input.address.line2 || null, userId, isDefault: count === 0 },
        });
      }
    }
    return order;
  },

  /**
   * Marks an order PAID exactly once (idempotent) and reduces stock in the SAME transaction.
   * Called by both /api/payments/verify and the Razorpay webhook — whichever arrives first wins,
   * the second call is a no-op.
   */
  async markPaid(params: { razorpayOrderId: string; razorpayPaymentId: string; signature?: string; method?: string; amount?: number }) {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { razorpayOrderId: params.razorpayOrderId }, include: { items: true } });
      if (!order) throw new ApiError(404, "Order not found");

      // Atomic status flip: only one caller can move PENDING → PAID
      const flipped = await tx.order.updateMany({
        where: { id: order.id, status: "PENDING" },
        data: { status: "PAID", paidAt: new Date() },
      });

      await tx.payment.upsert({
        where: { razorpayPaymentId: params.razorpayPaymentId },
        update: { status: "CAPTURED", signature: params.signature ?? undefined, method: params.method ?? undefined },
        create: {
          orderId: order.id,
          razorpayOrderId: params.razorpayOrderId,
          razorpayPaymentId: params.razorpayPaymentId,
          signature: params.signature,
          method: params.method,
          amount: params.amount ?? order.total * 100,
          status: "CAPTURED",
        },
      });

      if (flipped.count === 0) return { order, firstTime: false }; // already processed

      for (const item of order.items) {
        if (!item.productId) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
        });
      }
      // never let stock go below zero (if two people bought the last piece at the same time)
      await tx.product.updateMany({ where: { stock: { lt: 0 } }, data: { stock: 0 } });

      if (order.couponCode) {
        await tx.coupon.updateMany({ where: { code: order.couponCode }, data: { usedCount: { increment: 1 } } });
      }
      if (order.userId) {
        await tx.cartItem.deleteMany({ where: { cart: { userId: order.userId } } });
      }
      return { order: { ...order, status: "PAID" as OrderStatus }, firstTime: true };
    });

    if (result.firstTime) {
      await emailService.orderPlaced(result.order);
    }
    return result.order;
  },

  async markPaymentFailed(razorpayOrderId: string, razorpayPaymentId: string | undefined, reason?: string) {
    const order = await prisma.order.findUnique({ where: { razorpayOrderId } });
    if (!order) return;
    if (razorpayPaymentId) {
      await prisma.payment.upsert({
        where: { razorpayPaymentId },
        update: { status: "FAILED", errorReason: reason },
        create: { orderId: order.id, razorpayOrderId, razorpayPaymentId, amount: order.total * 100, status: "FAILED", errorReason: reason },
      });
    }
  },

  async getByNumber(orderNumber: string) {
    return prisma.order.findUnique({ where: { orderNumber }, include: fullOrderInclude });
  },

  /** Guest order tracking: order number + matching email or phone. */
  async track(orderNumber: string, contact: string) {
    const order = await prisma.order.findUnique({ where: { orderNumber }, include: fullOrderInclude });
    const c = contact.trim().toLowerCase();
    if (!order || (order.email.toLowerCase() !== c && order.phone !== c.replace(/\D/g, "").slice(-10))) {
      throw new ApiError(404, "We couldn't find an order with those details");
    }
    return order;
  },

  async listForUser(userId: string) {
    return prisma.order.findMany({
      where: { userId, status: { not: "PENDING" } },
      include: fullOrderInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  // ----------------------------- ADMIN -----------------------------

  async adminList(params: { status?: string; q?: string; page?: number; pageSize?: number }) {
    const where: Prisma.OrderWhereInput = {};
    if (params.status && params.status !== "ALL") where.status = params.status as OrderStatus;
    if (params.q) {
      where.OR = [
        { orderNumber: { contains: params.q.toUpperCase() } },
        { email: { contains: params.q, mode: "insensitive" } },
        { customerName: { contains: params.q, mode: "insensitive" } },
        { phone: { contains: params.q } },
      ];
    }
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { _count: { select: { items: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  },

  async adminGet(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: { orderBy: { createdAt: "desc" } }, user: { select: { id: true, name: true, email: true } } },
    });
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  },

  async adminUpdate(id: string, input: z.infer<typeof orderUpdateSchema>) {
    const before = await prisma.order.findUnique({ where: { id } });
    if (!before) throw new ApiError(404, "Order not found");
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: input.status,
        courier: input.courier === undefined ? undefined : input.courier || null,
        trackingNumber: input.trackingNumber === undefined ? undefined : input.trackingNumber || null,
      },
      include: fullOrderInclude,
    });
    if (input.status && input.status !== before.status) {
      await emailService.orderStatusChanged(order, input.status);
    }
    return order;
  },
};
