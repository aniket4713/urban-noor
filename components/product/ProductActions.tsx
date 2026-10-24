"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, ShoppingBag, Truck, Zap } from "lucide-react";
import { useCart, type CartProduct } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { QtyStepper } from "@/components/store/CartDrawer";
import { cn } from "@/lib/utils";

export function ProductActions({ product }: { product: CartProduct }) {
  const router = useRouter();
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;
  const liked = ids.has(product.id);

  const img = () => document.getElementById("product-main-image");

  return (
    <div className="space-y-5">
      <div className="text-sm">
        {soldOut ? (
          <span className="text-red-600">Out of stock — back soon</span>
        ) : product.stock <= 5 ? (
          <span className="flex items-center gap-2 text-gold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            Hurry — only {product.stock} left!
          </span>
        ) : (
          <span className="flex items-center gap-2 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> In stock, ready to ship
          </span>
        )}
      </div>

      {!soldOut && (
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-widest text-ivory/50">Qty</span>
          <QtyStepper value={qty} max={Math.min(10, product.stock)} onChange={(v) => setQty(Math.max(1, v))} />
        </div>
      )}

      <div className="flex gap-3">
        <motion.button whileTap={{ scale: 0.97 }} disabled={soldOut} onClick={() => add(product, qty, img())} className="btn-gold flex-1 py-4">
          <ShoppingBag className="h-4 w-4" /> Add to bag
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => toggle(product.id)}
          className={cn("flex h-[52px] w-[52px] items-center justify-center rounded-full border transition", liked ? "border-gold bg-gold/10" : "border-ivory/15 hover:border-magenta")}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("h-5 w-5", liked ? "fill-gold text-gold" : "")} />
        </motion.button>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={soldOut}
        onClick={() => {
          add(product, qty);
          router.push("/checkout");
        }}
        className="btn-outline w-full py-4"
      >
        <Zap className="h-4 w-4" /> Buy it now
      </motion.button>

      <div className="flex items-center gap-3 rounded-2xl border border-ivory/5 bg-noir-800 p-4 text-sm text-ivory/65">
        <Truck className="h-5 w-5 flex-shrink-0 text-gold" />
        Dispatched within 24 hours · Delivered in 3–7 days across India
      </div>
    </div>
  );
}

export function Accordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-ivory/10 border-y border-ivory/5">
      {items.map((it, i) => (
        <div key={it.title}>
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between py-4 text-left text-sm uppercase tracking-widest text-ivory/80 hover:text-magenta">
            {it.title}
            <motion.span animate={{ rotate: open === i ? 180 : 0 }}>
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="pb-5 text-sm leading-relaxed text-ivory/60">{it.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
