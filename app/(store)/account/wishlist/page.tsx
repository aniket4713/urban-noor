"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/store/ProductGrid";
import type { CardProduct } from "@/components/store/ProductCard";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { api } from "@/lib/fetcher";

export default function WishlistPage() {
  const { ids, ready } = useWishlist();
  const [items, setItems] = useState<CardProduct[] | null>(null);

  useEffect(() => {
    api<{ items: CardProduct[] }>("/api/wishlist")
      .then((r) => setItems(r.items))
      .catch(() => setItems([]));
  }, []);

  // hide items the user un-hearts on this page
  const visible = items?.filter((i) => !ready || ids.has(i.id)) ?? null;

  return (
    <div>
      <h2 className="mb-6 font-display text-3xl">Wishlist</h2>
      {!visible ? (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton aspect-[4/5]" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="font-display text-3xl">Nothing saved yet</p>
          <p className="mt-2 text-sm text-ivory/55">Tap the ♡ on any piece to keep it here.</p>
          <Link href="/shop" className="btn-gold mt-6">Discover jewellery</Link>
        </div>
      ) : (
        <ProductGrid products={visible} className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3" />
      )}
    </div>
  );
}
