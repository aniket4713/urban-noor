"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { QtyStepper } from "@/components/store/CartDrawer";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { items, update, remove, subtotal, ready } = useCart();
  const valid = items.filter((i) => i.product);

  if (ready && valid.length === 0) {
    return (
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-display text-5xl">Your bag is empty</h1>
        <p className="mt-3 text-ivory/55">Treat yourself — you deserve to shine.</p>
        <Link href="/shop" className="btn-gold mt-8">
          Explore jewellery <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="mb-10 font-display text-5xl">Shopping Bag</h1>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-ivory/10 border-y border-ivory/5">
          <AnimatePresence initial={false}>
            {valid.map((i) => (
              <motion.li key={i.productId} layout exit={{ opacity: 0, x: -50 }} className="flex gap-5 py-6">
                <Link href={`/product/${i.product!.slug}`} className="h-32 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-noir-700">
                  <img src={i.product!.image || "/seed/hero.jpg"} alt={i.product!.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <Link href={`/product/${i.product!.slug}`} className="font-display text-xl hover:text-magenta">
                      {i.product!.name}
                    </Link>
                    <span className="font-medium">{formatINR(i.product!.price * i.quantity)}</span>
                  </div>
                  <span className="mt-1 text-sm text-gold">{formatINR(i.product!.price)} each</span>
                  {i.product!.stock < i.quantity && <span className="mt-1 text-xs text-red-600">Only {i.product!.stock} available</span>}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <QtyStepper value={i.quantity} max={Math.min(10, i.product!.stock)} onChange={(q) => update(i.productId, q)} />
                    <button onClick={() => remove(i.productId)} className="flex items-center gap-1 text-xs uppercase tracking-widest text-ivory/40 hover:text-red-600">
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="card h-fit space-y-4 p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl">Order Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-ivory/60">Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ivory/60">Shipping</span>
            <span className="text-ivory/60">Calculated at checkout</span>
          </div>
          <div className="divider-gold" />
          <Link href="/checkout" className="btn-gold w-full py-4">
            Proceed to checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="flex items-center justify-center gap-2 text-xs text-ivory/45">
            <ShieldCheck className="h-4 w-4 text-gold" /> 100% secure payments via Razorpay
          </p>
        </aside>
      </div>
    </div>
  );
}
