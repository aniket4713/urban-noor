"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { ToastProvider } from "./ToastProvider";
import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";
import { WishlistProvider } from "./WishlistProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // reducedMotion="user" → Framer Motion respects the OS "reduce motion" setting
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
