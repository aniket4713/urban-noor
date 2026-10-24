import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/store/ProductGrid";
import { productService } from "@/lib/services/productService";
import { categoryService } from "@/lib/services/categoryService";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  return []; // pages are generated on first visit, then cached (ISR)
}

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await categoryService.getBySlug(params.slug);
  if (!cat) return { title: "Category not found" };
  return {
    title: `${cat.name} — Artificial Jewellery`,
    description: cat.description || `Shop ${cat.name.toLowerCase()} for men and women at Urban Noor. Anti-tarnish, skin-friendly, free shipping above ₹999.`,
    alternates: { canonical: `/category/${cat.slug}` },
    openGraph: { images: cat.image ? [cat.image] : undefined },
  };
}

export default async function CategoryPage({ params }: Props) {
  const cat = await categoryService.getBySlug(params.slug);
  if (!cat) notFound();
  const result = await productService.list({ category: cat.slug, sort: "popular", pageSize: 48 });

  return (
    <div className="container-x py-12">
      <nav className="mb-8 text-xs uppercase tracking-widest text-ivory/40">
        <Link href="/" className="hover:text-magenta">Home</Link> / <Link href="/shop" className="hover:text-magenta">Shop</Link> / <span className="text-gold">{cat.name}</span>
      </nav>
      <div className="mb-12 text-center">
        <p className="eyebrow mb-3">Category</p>
        <h1 className="font-display text-5xl sm:text-6xl">{cat.name}</h1>
        {cat.description && <p className="mx-auto mt-3 max-w-xl text-ivory/55">{cat.description}</p>}
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/shop?category=${cat.slug}&gender=WOMEN`} className="btn-outline px-5 py-2 text-xs">For Her</Link>
          <Link href={`/shop?category=${cat.slug}&gender=MEN`} className="btn-outline px-5 py-2 text-xs">For Him</Link>
          <Link href={`/shop?category=${cat.slug}`} className="btn-ghost px-5 py-2 text-xs">Filter & sort →</Link>
        </div>
      </div>
      {result.items.length ? (
        <ProductGrid products={result.items} />
      ) : (
        <p className="py-20 text-center text-ivory/50">New pieces coming soon ✦</p>
      )}
    </div>
  );
}
