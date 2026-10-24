import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/product/Gallery";
import { Accordion, ProductActions } from "@/components/product/ProductActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SectionHeading } from "@/components/motion/Reveal";
import { productService } from "@/lib/services/productService";
import { discountPercent, formatINR, GENDER_LABEL, siteUrl } from "@/lib/utils";

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() {
  return []; // generated on first request then cached (ISR); admin edits revalidate instantly
}

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await productService.getBySlug(params.slug);
  if (!p) return { title: "Product not found" };
  const description = p.description.slice(0, 155);
  const image = p.images[0]?.url;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      title: `${p.name} — ${formatINR(p.price)}`,
      description,
      images: image ? [{ url: image, width: 800, height: 1000, alt: p.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const p = await productService.getBySlug(params.slug);
  if (!p) notFound();
  const related = await productService.related(p.id, p.categoryId, p.gender);
  const off = discountPercent(p.price, p.mrp);
  const images = p.images.map((i) => i.url);

  // Structured data so Google can show price & availability in search results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: images.map((u) => (u.startsWith("http") ? u : `${siteUrl()}${u}`)),
    description: p.description,
    sku: p.sku || p.id,
    brand: { "@type": "Brand", name: "Urban Noor" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: p.price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${siteUrl()}/product/${p.slug}`,
    },
  };

  return (
    <div className="container-x py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-8 text-xs uppercase tracking-widest text-ivory/40">
        <Link href="/" className="hover:text-magenta">Home</Link> / <Link href={`/category/${p.category.slug}`} className="hover:text-magenta">{p.category.name}</Link> /{" "}
        <span className="text-gold">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Gallery images={images} name={p.name} />

        <div className="lg:pt-4">
          <p className="eyebrow mb-3">
            {p.category.name} · {GENDER_LABEL[p.gender]}
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">{p.name}</h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-magenta">{formatINR(p.price)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-ivory/40 line-through">{formatINR(p.mrp)}</span>
                <span className="rounded-full bg-gold-pale px-3 py-1 text-xs font-semibold text-gold-dark">Save {off}%</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-ivory/40">Inclusive of all taxes</p>

          <div className="divider-gold my-8" />

          <ProductActions
            product={{ id: p.id, name: p.name, slug: p.slug, price: p.price, mrp: p.mrp, stock: p.stock, image: images[0] ?? null }}
          />

          <div className="mt-10">
            <Accordion
              items={[
                { title: "Description", content: <p className="whitespace-pre-line">{p.description}</p> },
                {
                  title: "Details",
                  content: (
                    <ul className="space-y-1">
                      {p.material && <li>Material: {p.material}</li>}
                      {p.sku && <li>SKU: {p.sku}</li>}
                      <li>Collection: {GENDER_LABEL[p.gender]}</li>
                      {p.tags.length > 0 && <li>Tags: {p.tags.join(", ")}</li>}
                    </ul>
                  ),
                },
                {
                  title: "Care Guide",
                  content: "Keep away from water, perfume and sweat. Wipe gently with a soft dry cloth after use and store in the Urban Noor pouch to preserve the shine.",
                },
                {
                  title: "Shipping & Returns",
                  content: (
                    <>
                      Free shipping on orders above ₹999. Easy 7-day returns on unused pieces in original packaging.{" "}
                      <Link href="/policies/returns" className="text-gold underline">Read policy</Link>
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeading eyebrow="Complete the look" title="You may also love" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
