"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatINR } from "@/lib/utils";

export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const { items, isOpen, close, update, remove, subtotal, count } = useCart();
  const valid = items.filter((i) => i.product);
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(100, (subtotal / Math.max(1, freeShippingThreshold)) * 100);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-gold/20 bg-noir-800"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-ivory/5 px-6 py-5">
              <h2 className="font-display text-2xl">
                Your Bag <span className="text-base text-ivory/40">({count})</span>
              </h2>
              <button onClick={close} className="rounded-full p-2 hover:bg-ivory/5" aria-label="Close cart">
                <X className="h-5 w-5" />
              </button>
            </div>

            {valid.length > 0 && (
              <div className="border-b border-ivory/5 px-6 py-4">
                <p className="mb-2 text-xs text-ivory/70">
                  {remaining > 0 ? (
                    <>
                      Add <span className="text-gold">{formatINR(remaining)}</span> more for <b>free shipping</b>
                    </>
                  ) : (
                    <>✦ You&apos;ve unlocked <b className="text-gold">free shipping</b></>
                  )}
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-ivory/10">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-gold-light via-magenta to-royal" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.6 }} />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {valid.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                    <ShoppingBag className="h-14 w-14 text-gold/60" />
                  </motion.div>
                  <p className="mt-4 font-display text-2xl">Your bag is empty</p>
                  <p className="mt-1 text-sm text-ivory/50">Let&apos;s find something that shines.</p>
                  <Link href="/shop" onClick={close} className="btn-gold mt-6">
                    Start shopping
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {valid.map((i) => (
                      <motion.li key={i.productId} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60, height: 0 }} className="flex gap-4">
                        <Link href={`/product/${i.product!.slug}`} onClick={close} className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-noir-700">
                          <img src={i.product!.image || "/seed/hero.jpg"} alt={i.product!.name} className="h-full w-full object-cover" />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <Link href={`/product/${i.product!.slug}`} onClick={close} className="text-sm leading-snug hover:text-magenta">
                            {i.product!.name}
                          </Link>
                          <span className="mt-1 text-sm text-gold">{formatINR(i.product!.price)}</span>
                          <div className="mt-auto flex items-center justify-between">
                            <QtyStepper value={i.quantity} max={Math.min(10, i.product!.stock)} onChange={(q) => update(i.productId, q)} />
                            <button onClick={() => remove(i.productId)} className="p-1 text-ivory/40 hover:text-red-600" aria-label="Remove item">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {valid.length > 0 && (
              <div className="space-y-3 border-t border-ivory/5 px-6 py-5">
                <div className="flex justify-between text-sm">
                  <span className="text-ivory/60">Subtotal</span>
                  <span className="font-medium">{formatINR(subtotal)}</span>
                </div>
                <p className="text-xs text-ivory/40">Shipping & coupons calculated at checkout.</p>
                <Link href="/checkout" onClick={close} className="btn-gold w-full">
                  Checkout securely
                </Link>
                <Link href="/cart" onClick={close} className="btn-ghost w-full text-xs uppercase tracking-widest">
                  View full bag
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function QtyStepper({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-ivory/10">
      <button className="p-2 text-ivory/70 hover:text-magenta disabled:opacity-30" onClick={() => onChange(value - 1)} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <motion.span key={value} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-6 text-center text-sm">
        {value}
      </motion.span>
      <button className="p-2 text-ivory/70 hover:text-magenta disabled:opacity-30" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
