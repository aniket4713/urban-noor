import { handle, ok } from "@/lib/api";
import { productService } from "@/lib/services/productService";

export const dynamic = "force-dynamic";

/** Live search suggestions: GET /api/search?q=ring */
export const GET = handle(async (req: Request) => {
  const q = (new URL(req.url).searchParams.get("q") || "").trim().slice(0, 60);
  return ok({ results: await productService.suggestions(q) });
});
