import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { productService } from "@/lib/services/productService";

export const POST = handle(async (_req: Request, { params }: { params: { id: string } }) => {
  await requireAdmin();
  const product = await productService.duplicate(params.id);
  return ok({ product }, 201);
});
