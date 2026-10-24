import { ApiError, handle, ok } from "@/lib/api";
import { productService } from "@/lib/services/productService";

export const GET = handle(async (_req: Request, { params }: { params: { slug: string } }) => {
  const product = await productService.getBySlug(params.slug);
  if (!product) throw new ApiError(404, "Product not found");
  return ok({ product });
});
