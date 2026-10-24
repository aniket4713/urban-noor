import { handle, ok } from "@/lib/api";
import { parseListParams, productService } from "@/lib/services/productService";

export const dynamic = "force-dynamic";

/** GET /api/products?q=&gender=&category=&minPrice=&maxPrice=&inStock=1&sort=&page= */
export const GET = handle(async (req: Request) => {
  const params = parseListParams(new URL(req.url).searchParams);
  return ok(await productService.list(params));
});
