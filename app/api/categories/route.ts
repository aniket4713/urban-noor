import { handle, ok } from "@/lib/api";
import { categoryService } from "@/lib/services/categoryService";

export const revalidate = 300;

export const GET = handle(async () => {
  return ok({ categories: await categoryService.list() });
});
