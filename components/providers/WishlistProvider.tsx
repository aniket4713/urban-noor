"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/fetcher";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";

type WishlistCtx = { ids: Set<string>; ready: boolean; toggle: (productId: string) => Promise<void> };

const Ctx = createContext<WishlistCtx>({ ids: new Set(), ready: false, toggle: async () => {} });
export const useWishlist = () => useContext(Ctx);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      setReady(false);
      return;
    }
    api<{ ids: string[] }>("/api/wishlist?ids=1")
      .then((r) => setIds(new Set(r.ids)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, [user]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) {
        toast("Log in to save favourites", "info");
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      // optimistic update
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });
      try {
        const r = await api<{ inWishlist: boolean }>("/api/wishlist", { body: { productId } });
        toast(r.inWishlist ? "Saved to wishlist ♡" : "Removed from wishlist", "info");
      } catch (e) {
        toast((e as Error).message, "error");
      }
    },
    [user, toast, router]
  );

  return <Ctx.Provider value={{ ids, ready, toggle }}>{children}</Ctx.Provider>;
}
