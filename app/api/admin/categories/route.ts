import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { revalidateStore } from "@/lib/revalidate";
import { categorySchema } from "@/lib/validators";
import { categoryService } from "@/lib/services/categoryService";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok({ categories: await categoryService.list() });
});

export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const category = await categoryService.create(categorySchema.parse(await readJson(req)));
  revalidateStore({ categorySlugs: [category.slug] });
  return ok({ category }, 201);
});
