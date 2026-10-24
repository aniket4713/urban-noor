import { handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { userService } from "@/lib/services/userService";

type Ctx = { params: { id: string } };

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  await userService.deleteAddress(user.sub, params.id);
  return ok({ ok: true });
});

/** PATCH → make this the default address */
export const PATCH = handle(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  await userService.setDefaultAddress(user.sub, params.id);
  return ok({ ok: true });
});
