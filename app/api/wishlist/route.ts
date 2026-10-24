import { z } from "zod";
import { handle, ok, readJson } from "@/lib/api";
import { getSession, requireUser } from "@/lib/auth";
import { wishlistService } from "@/lib/services/wishlistService";

export const dynamic = "force-dynamic";

/** GET /api/wishlist → { ids, items } (ids only if ?ids=1) */
export const GET = handle(async (req: Request) => {
  const session = await getSession();
  if (!session) return ok({ ids: [], items: [] });
  if (new URL(req.url).searchParams.get("ids") === "1") {
    return ok({ ids: await wishlistService.ids(session.sub) });
  }
  const items = await wishlistService.list(session.sub);
  return ok({ ids: items.map((i) => i.id), items });
});

/** POST { productId } → toggles */
export const POST = handle(async (req: Request) => {
  const user = await requireUser();
  const { productId } = z.object({ productId: z.string().min(1) }).parse(await readJson(req));
  return ok(await wishlistService.toggle(user.sub, productId));
});
