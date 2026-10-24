import { clientIp, handle, ok, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { verifyPaymentSchema } from "@/lib/validators";
import { paymentService } from "@/lib/services/paymentService";

/**
 * Step 2 of payment: the browser sends what Razorpay Checkout returned.
 * We verify the HMAC signature on the server before marking the order PAID.
 */
export const POST = handle(async (req: Request) => {
  rateLimit(`verify:${clientIp(req)}`, 20, 60_000);
  const input = verifyPaymentSchema.parse(await readJson(req));
  return ok(await paymentService.verify(input));
});
