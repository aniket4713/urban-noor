import crypto from "crypto";
import Razorpay from "razorpay";
import { ApiError } from "./api";

let client: Razorpay | null = null;

/** Lazily create the Razorpay client so the app still builds without keys. */
export function razorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new ApiError(500, "Payments are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env");
  }
  if (!client) client = new Razorpay({ key_id, key_secret });
  return client;
}

/** Constant-time string comparison to avoid timing attacks. */
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/**
 * Checkout signature check.
 * Razorpay signs `${razorpay_order_id}|${razorpay_payment_id}` with your KEY SECRET (HMAC-SHA256).
 * If our computed hash matches the signature the browser sent us, the payment is genuine.
 */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqual(expected, signature);
}

/**
 * Webhook signature check.
 * Razorpay signs the RAW request body with your WEBHOOK SECRET (set in Dashboard → Webhooks).
 * Must be computed on the raw text, not on re-serialised JSON.
 */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
