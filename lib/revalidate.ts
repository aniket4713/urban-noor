import { revalidatePath } from "next/cache";

/** Refresh cached (ISR) storefront pages after an admin change. */
export function revalidateStore(opts: { productSlugs?: string[]; categorySlugs?: string[] } = {}) {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/sitemap.xml");
  for (const s of opts.productSlugs ?? []) revalidatePath(`/product/${s}`);
  for (const s of opts.categorySlugs ?? []) revalidatePath(`/category/${s}`);
}

/** Settings appear in the layout (announcement, footer, WhatsApp), so refresh everything. */
export function revalidateAll() {
  revalidatePath("/", "layout");
}
