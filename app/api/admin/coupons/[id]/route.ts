import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { couponSchema } from "@/lib/validators";
import { couponService } from "@/lib/services/couponService";

type Ctx = { params: { id: string } };

export const PUT = handle(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const coupon = await couponService.update(params.id, couponSchema.parse(await readJson(req)));
  return ok({ coupon });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  await couponService.remove(params.id);
  return ok({ ok: true });
});
