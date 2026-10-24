import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { orderUpdateSchema } from "@/lib/validators";
import { orderService } from "@/lib/services/orderService";

type Ctx = { params: { id: string } };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  return ok({ order: await orderService.adminGet(params.id) });
});

/** PATCH { status?, courier?, trackingNumber? } — status change emails the customer */
export const PATCH = handle(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const input = orderUpdateSchema.parse(await readJson(req));
  await orderService.adminUpdate(params.id, input);
  return ok({ order: await orderService.adminGet(params.id) });
});
