import { z } from "zod";
import { handle, ok, readJson } from "@/lib/api";
import { cartLineSchema } from "@/lib/validators";
import { cartService } from "@/lib/services/cartService";

const bodySchema = z.object({ items: z.array(cartLineSchema).max(50) });

/** Refresh prices/stock for a guest cart stored in localStorage. */
export const POST = handle(async (req: Request) => {
  const { items } = bodySchema.parse(await readJson(req));
  return ok({ items: await cartService.hydrate(items) });
});
