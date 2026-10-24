"use client";

import { Stagger } from "@/components/motion/Reveal";
import { ProductCard, type CardProduct } from "./ProductCard";

export function ProductGrid({ products, className }: { products: CardProduct[]; className?: string }) {
  return (
    <Stagger className={className ?? "grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4"}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </Stagger>
  );
}
