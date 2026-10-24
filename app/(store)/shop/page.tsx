import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Filters, Pagination, SortSelect } from "@/components/shop/Filters";
import { ProductGrid } from "@/components/store/ProductGrid";
import { parseListParams, productService } from "@/lib/services/productService";
import { categoryService } from "@/lib/services/categoryService";

type Props = { searchParams: Record<string, string | string[] | undefined> };

function heading(sp: Props["searchParams"]) {
  if (sp.q) return `Results for “${sp.q}”`;
  if (sp.gender === "WOMEN") return "Women’s Jewellery";
  if (sp.gender === "MEN") return "Men’s Jewellery";
  if (sp.sort === "popular") return "Best Sellers";
  return "Shop All Jewellery";
}

export function generateMetadata({ searchParams }: Props): Metadata {
  const title = heading(searchParams);
  return {
    title,
    description: `${title} — artificial jewellery at Urban Noor. Anti-tarnish, skin-friendly, delivered across India.`,
    alternates: { canonical: "/shop" },
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const params = parseListParams(searchParams);
  const [result, categories] = await Promise.all([productService.list(params), categoryService.list()]);

  return (
    <div className="container-x py-12">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-3">Urban Noor</p>
        <h1 className="font-display text-5xl sm:text-6xl">{heading(searchParams)}</h1>
        <p className="mt-3 text-sm text-ivory/50">{result.total} pieces</p>
      </div>

      <Suspense>
        <div className="flex gap-10">
          <Filters categories={categories} />
          <div className="min-w-0 flex-1">
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-ivory/5 pb-5">
              <span className="hidden text-sm text-ivory/50 lg:block">
                Showing {result.items.length} of {result.total}
              </span>
              <div className="lg:hidden" />
              <SortSelect />
            </div>

            {result.items.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-display text-3xl">Nothing here… yet</p>
                <p className="mt-2 text-sm text-ivory/50">Try removing a filter or searching for something else.</p>
                <Link href="/shop" className="btn-outline mt-6">
                  Reset filters
                </Link>
              </div>
            ) : (
              <ProductGrid products={result.items} className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3" />
            )}
            <Pagination page={result.page} totalPages={result.totalPages} />
          </div>
        </div>
      </Suspense>
    </div>
  );
}
