import type { MetadataRoute } from "next";
import { productService } from "@/lib/services/productService";
import { categoryService } from "@/lib/services/categoryService";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticPages = ["", "/shop", "/about", "/contact", "/track-order", "/policies/shipping", "/policies/returns", "/policies/privacy", "/policies/terms"].map(
    (p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 })
  );
  try {
    const [products, categories] = await Promise.all([productService.allSlugs(), categoryService.list()]);
    return [
      ...staticPages,
      ...categories.map((c) => ({ url: `${base}/category/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.9 })),
    ];
  } catch {
    return staticPages;
  }
}
