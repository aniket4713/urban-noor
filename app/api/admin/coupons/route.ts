import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { couponSchema } from "@/lib/validators";
import { couponService } from "@/lib/services/couponService";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok({ coupons: await couponService.list() });
});

export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const coupon = await couponService.create(couponSchema.parse(await readJson(req)));
  return ok({ coupon }, 201);
});
