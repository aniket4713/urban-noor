import { handle, ok } from "@/lib/api";
import { paymentService } from "@/lib/services/paymentService";

export const dynamic = "force-dynamic";

/**
 * Razorpay webhook (Dashboard → Settings → Webhooks):
 *   URL:    https://<your-domain>/api/payments/webhook
 *   Secret: same as RAZORPAY_WEBHOOK_SECRET
 *   Events: payment.captured, payment.failed, order.paid
 *
 * We read the RAW body text because the signature is computed over the exact bytes Razorpay sent.
 */
export const POST = handle(async (req: Request) => {
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const result = await paymentService.handleWebhook(raw, signature);
  return ok(result);
});
