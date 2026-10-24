"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api } from "@/lib/fetcher";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  stock: number;
  image: string | null;
};
export type CartItem = { productId: string; quantity: number; product: CartProduct | null };

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  isOpen: boolean;
  bump: number; // increments on every add → animates the cart badge
  open: () => void;
  close: () => void;
  add: (product: CartProduct, qty?: number, sourceImg?: HTMLElement | null) => void;
  update: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "un_cart_v1";
const MAX_QTY = 10;

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

function readLocal(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

/** Animates a clone of the product image flying into the cart icon in the header. */
function flyToCart(source?: HTMLElement | null) {
  if (!source || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = document.getElementById("cart-icon");
  if (!target) return;
  const s = source.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  const clone = source.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: "fixed",
    left: `${s.left}px`,
    top: `${s.top}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    zIndex: "200",
    borderRadius: "16px",
    overflow: "hidden",
    pointerEvents: "none",
    boxShadow: "0 0 40px rgba(194,24,107,.5)",
  });
  document.body.appendChild(clone);
  const dx = t.left + t.width / 2 - (s.left + s.width / 2);
  const dy = t.top + t.height / 2 - (s.top + s.height / 2);
  clone
    .animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.6}px, ${dy - 80}px) scale(0.5)`, opacity: 0.9, offset: 0.6 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.3 },
      ],
      { duration: 800, easing: "cubic-bezier(.6,-0.05,.4,1)" }
    )
    .finished.finally(() => clone.remove());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const syncedUser = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  // 1) Load the guest cart from localStorage and refresh prices/stock from the server
  useEffect(() => {
    const local = readLocal();
    setItems(local);
    setReady(true);
    if (local.length) {
      api<{ items: CartItem[] }>("/api/cart/hydrate", {
        body: { items: local.map(({ productId, quantity }) => ({ productId, quantity })) },
      })
        .then((r) => setItems(r.items.filter((i) => i.product)))
        .catch(() => {});
    }
  }, []);

  // 2) On login: merge the local cart with the saved account cart
  useEffect(() => {
    if (!ready) return;
    if (!user) {
      syncedUser.current = null;
      return;
    }
    if (syncedUser.current === user.id) return;
    syncedUser.current = user.id;
    (async () => {
      try {
        const server = await api<{ items: CartItem[] }>("/api/cart");
        const merged = new Map<string, number>();
        for (const i of [...server.items, ...readLocal()]) {
          merged.set(i.productId, Math.min(MAX_QTY, Math.max(merged.get(i.productId) ?? 0, i.quantity)));
        }
        const res = await api<{ items: CartItem[] }>("/api/cart", {
          method: "PUT",
          body: { items: Array.from(merged, ([productId, quantity]) => ({ productId, quantity })) },
        });
        setItems(res.items.filter((i) => i.product));
      } catch {
        /* keep local cart */
      }
    })();
  }, [user, ready]);

  // 3) Persist every change (localStorage always; server when logged in, debounced)
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
    if (user && syncedUser.current === user.id) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        api("/api/cart", {
          method: "PUT",
          body: { items: items.map(({ productId, quantity }) => ({ productId, quantity })) },
        }).catch(() => {});
      }, 600);
    }
  }, [items, ready, user]);

  const add = useCallback(
    (product: CartProduct, qty = 1, sourceImg?: HTMLElement | null) => {
      if (product.stock <= 0) {
        toast("Sorry, this piece is out of stock", "error");
        return;
      }
      flyToCart(sourceImg);
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        const limit = Math.min(MAX_QTY, product.stock);
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, quantity: Math.min(limit, i.quantity + qty), product } : i
          );
        }
        return [...prev, { productId: product.id, quantity: Math.min(limit, qty), product }];
      });
      setTimeout(() => setBump((b) => b + 1), sourceImg ? 650 : 0);
      toast(`${product.name} added to cart`);
    },
    [toast]
  );

  const update = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const limit = Math.min(MAX_QTY, i.product?.stock ?? MAX_QTY);
          return { ...i, quantity: Math.max(0, Math.min(limit, qty)) };
        })
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const remove = useCallback((productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => {
    const valid = items.filter((i) => i.product);
    return {
      items,
      count: valid.reduce((s, i) => s + i.quantity, 0),
      subtotal: valid.reduce((s, i) => s + i.quantity * (i.product?.price ?? 0), 0),
      ready,
      isOpen,
      bump,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      update,
      remove,
      clear,
    };
  }, [items, ready, isOpen, bump, add, update, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
