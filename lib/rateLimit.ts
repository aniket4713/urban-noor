import { ApiError } from "./api";

/**
 * Simple in-memory fixed-window rate limiter.
 * NOTE: on serverless (Vercel) each instance has its own memory, so this is a
 * best-effort guard. For strict limits at scale, swap for Upstash Redis.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    bucket.count++;
    if (bucket.count > limit) {
      throw new ApiError(429, "Too many attempts. Please wait a minute and try again.");
    }
  }
  // occasional cleanup
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }
}
