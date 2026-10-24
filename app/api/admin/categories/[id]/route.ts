import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { revalidateStore } from "@/lib/revalidate";
import { categorySchema } from "@/lib/validators";
import { categoryService } from "@/lib/services/categoryService";

type Ctx = { params: { id: string } };

export const PUT = handle(async (req: Request, { params }: Ctx) => {
  await requireAdmin();
  const category = await categoryService.update(params.id, categorySchema.parse(await readJson(req)));
  revalidateStore({ categorySlugs: [category.slug] });
  return ok({ category });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  await requireAdmin();
  const c = await categoryService.remove(params.id);
  revalidateStore({ categorySlugs: [c.slug] });
  return ok({ ok: true });
});
