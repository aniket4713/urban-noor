import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { revalidateStore } from "@/lib/revalidate";
import { productSchema } from "@/lib/validators";
import { parseListParams, productService } from "@/lib/services/productService";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const sp = new URL(req.url).searchParams;
  const params = parseListParams(sp);
  return ok(await productService.adminList({ ...params, pageSize: 20, status: sp.get("status") || undefined }));
});

export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const input = productSchema.parse(await readJson(req));
  const product = await productService.create(input);
  revalidateStore({ productSlugs: [product.slug], categorySlugs: [product.category.slug] });
  return ok({ product }, 201);
});
