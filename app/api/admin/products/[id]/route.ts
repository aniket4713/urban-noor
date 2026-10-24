import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { revalidateStore } from "@/lib/revalidate";
import { productSchema } from "@/lib/validators";
import { productService } from "@/lib/services/productService";

type Ctx = { params: { id: string } };

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  return ok({ product: await productService.adminGet(params.id) });
});

export const PUT = handle(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const input = productSchema.parse(await readJson(req));
  const { before, updated } = await productService.update(params.id, input);
  revalidateStore({
    productSlugs: [before.slug, updated.slug],
    categorySlugs: [before.category.slug, updated.category.slug],
  });
  return ok({ product: updated });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const removed = await productService.remove(params.id);
  revalidateStore({ productSlugs: [removed.slug], categorySlugs: [removed.category.slug] });
  return ok({ ok: true });
});
