import { handle, ok, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { addressSchema } from "@/lib/validators";
import { userService } from "@/lib/services/userService";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const user = await requireUser();
  return ok({ addresses: await userService.addresses(user.sub) });
});

export const POST = handle(async (req: Request) => {
  const user = await requireUser();
  const input = addressSchema.parse(await readJson(req));
  return ok({ address: await userService.addAddress(user.sub, input) }, 201);
});
