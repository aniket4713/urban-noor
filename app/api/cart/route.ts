import { z } from "zod";
import { handle, ok, readJson } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { cartLineSchema } from "@/lib/validators";
import { cartService } from "@/lib/services/cartService";

export const dynamic = "force-dynamic";

const bodySchema = z.object({ items: z.array(cartLineSchema).max(50) });

/** Saved cart of the logged-in user */
export const GET = handle(async () => {
  const user = await requireUser();
  return ok({ items: await cartService.getForUser(user.sub) });
});

/** Replace the saved cart (client sends the merged local + server cart) */
export const PUT = handle(async (req: Request) => {
  const user = await requireUser();
  const { items } = bodySchema.parse(await readJson(req));
  return ok({ items: await cartService.replace(user.sub, items) });
});
