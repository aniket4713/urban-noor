"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { cn, discountPercent, formatINR } from "@/lib/utils";
import { staggerItem } from "@/components/motion/Reveal";

export type CardProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  stock: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  category?: { name: string } | null;
  images: { url: string }[];
};

export function ProductCard({ product, priority }: { product: CardProduct; priority?: boolean }) {
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const imgRef = useRef<HTMLDivElement>(null);
  const off = discountPercent(product.price, product.mrp);
  const img1 = product.images[0]?.url || "/seed/hero.jpg";
  const img2 = product.images[1]?.url;
  const soldOut = product.stock <= 0;
  const liked = ids.has(product.id);

  return (
    <motion.article variants={staggerItem} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="group relative">
      <div ref={imgRef} className="shine relative aspect-[4/5] overflow-hidden rounded-2xl bg-noir-700 shadow-card">
        <Link href={`/product/${product.slug}`} aria-label={product.name}>
          <Image
            src={img1}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn("object-cover transition-all duration-700 group-hover:scale-105", img2 && "group-hover:opacity-0")}
          />
          {img2 && (
            <Image src={img2} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" className="scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100" />
          )}
        </Link>

        {/* badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {soldOut ? (
            <Badge className="bg-ivory/90 text-white">Sold out</Badge>
          ) : (
            <>
              {off > 0 && <Badge className="bg-brand text-white">-{off}%</Badge>}
              {product.isNewArrival && <Badge className="bg-royal text-white">New</Badge>}
              {product.isBestSeller && <Badge className="bg-noir/80 text-ivory border border-ivory/20">Bestseller</Badge>}
            </>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => toggle(product.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-noir/60 backdrop-blur transition hover:bg-noir"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("h-4 w-4 transition", liked ? "fill-magenta text-magenta" : "text-ivory")} />
        </motion.button>

        {/* quick add — slides up on hover (always visible on touch screens) */}
        <div className="absolute inset-x-3 bottom-3 translate-y-0 opacity-100 transition-all duration-500 md:translate-y-4 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <button
            disabled={soldOut}
            onClick={() =>
              add(
                { id: product.id, name: product.name, slug: product.slug, price: product.price, mrp: product.mrp, stock: product.stock, image: img1 },
                1,
                imgRef.current
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ivory/95 py-2.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur transition hover:bg-brand disabled:opacity-60"
          >
            <ShoppingBag className="h-4 w-4" />
            {soldOut ? "Sold out" : "Add to bag"}
          </button>
        </div>
      </div>

      <div className="mt-4 px-1">
        {product.category && <p className="text-[10px] uppercase tracking-[0.25em] text-ivory/40">{product.category.name}</p>}
        <Link href={`/product/${product.slug}`}>
          <h3 className="mt-1 line-clamp-1 font-display text-lg text-ivory/95 transition group-hover:text-magenta">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-semibold text-magenta">{formatINR(product.price)}</span>
          {off > 0 && <span className="text-xs text-ivory/40 line-through">{formatINR(product.mrp)}</span>}
        </div>
      </div>
    </motion.article>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider", className)}>{children}</span>;
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="skeleton aspect-[4/5] rounded-2xl" />
      <div className="skeleton mt-4 h-3 w-1/3" />
      <div className="skeleton mt-2 h-5 w-3/4" />
      <div className="skeleton mt-2 h-4 w-1/4" />
    </div>
  );
}
