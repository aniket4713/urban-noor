import { Hero } from "@/components/home/Hero";
import { CollectionTiles } from "@/components/home/CollectionTiles";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { WhyUs } from "@/components/home/WhyUs";
import { InstaGrid } from "@/components/home/InstaGrid";
import { Newsletter } from "@/components/store/Newsletter";
import { productService } from "@/lib/services/productService";
import { categoryService } from "@/lib/services/categoryService";
import { settingsService } from "@/lib/services/settingsService";

// ISR: the home page is cached and rebuilt at most every 5 minutes
// (and instantly when an admin edits a product — see lib/revalidate.ts)
export const revalidate = 300;

export default async function HomePage() {
  const [settings, sections, categories] = await Promise.all([
    settingsService.getSafe(),
    productService.home(),
    categoryService.list(),
  ]);

  return (
    <>
      <Hero title={settings.heroTitle} subtitle={settings.heroSubtitle} image={settings.heroImage} />
      <CollectionTiles />
      <CategoryTiles categories={categories} />
      <ProductCarousel eyebrow="Just Landed" title="New Arrivals" products={sections.newArrivals} viewAll="/shop?sort=newest" />
      <WhyUs />
      <ProductCarousel eyebrow="Most Loved" title="Best Sellers" products={sections.bestSellers} viewAll="/shop?sort=popular" />
      <InstaGrid url={settings.instagramUrl} />
      <Newsletter />
    </>
  );
}
