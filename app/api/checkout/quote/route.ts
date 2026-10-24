import { z } from "zod";
import { handle, ok, readJson } from "@/lib/api";
import { cartLineSchema } from "@/lib/validators";
import { orderService } from "@/lib/services/orderService";

const bodySchema = z.object({
  items: z.array(cartLineSchema).min(1).max(50),
  couponCode: z.string().trim().max(30).optional(),
});

/**
 * POST /api/checkout/quote → server-calculated totals for the order summary
 * (and to validate a coupon before paying).
 */
export const POST = handle(async (req: Request) => {
  const { items, couponCode } = bodySchema.parse(await readJson(req));
  const q = await orderService.quote(items, couponCode || undefined);
  return ok(q);
});
