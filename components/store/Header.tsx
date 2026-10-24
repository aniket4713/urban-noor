"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { useCart } from "@/components/providers/CartProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop?gender=WOMEN", label: "Women" },
  { href: "/shop?gender=MEN", label: "Men" },
  { href: "/shop?sort=newest", label: "New Arrivals" },
  { href: "/shop?sort=popular", label: "Best Sellers" },
  { href: "/category/jewellery-sets", label: "Bridal Sets" },
];

export function Header() {
  const pathname = usePathname();
  const { count, bump, open } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        scrolled ? "border-b border-gold/15 bg-noir/80 shadow-card backdrop-blur-xl" : "bg-noir/40 backdrop-blur-sm"
      )}
    >
      <div className={cn("container-x flex items-center justify-between gap-4 transition-all", scrolled ? "h-16" : "h-20")}>
        <button className="lg:hidden text-ivory/80" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>

        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className="group relative text-[13px] uppercase tracking-[0.18em] text-ivory/75 transition hover:text-magenta">
              {n.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-brand transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden w-64 xl:block">
            <SearchBar />
          </div>
          <IconBtn label="Search" className="xl:hidden" onClick={() => setSearchOpen((s) => !s)}>
            <Search className="h-5 w-5" />
          </IconBtn>
          <IconBtn label="Wishlist" href={user ? "/account/wishlist" : "/login?next=/account/wishlist"} className="hidden sm:flex">
            <Heart className="h-5 w-5" />
          </IconBtn>
          <IconBtn label="Account" href={user ? "/account" : "/login"}>
            <User className="h-5 w-5" />
          </IconBtn>
          <button id="cart-icon" onClick={open} className="relative flex h-10 w-10 items-center justify-center rounded-full text-ivory/85 transition hover:bg-ivory/5 hover:text-magenta" aria-label={`Cart, ${count} items`}>
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={bump}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: [1.5, 0.9, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* compact search drawer */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-visible border-t border-ivory/5 xl:hidden">
            <div className="container-x py-3">
              <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-sm flex-col bg-noir-800 p-6"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo />
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6 text-ivory/70" />
                </button>
              </div>
              <nav className="flex flex-col">
                {[...NAV, { href: "/shop", label: "Shop All" }, { href: "/track-order", label: "Track Order" }].map((n, i) => (
                  <motion.div key={n.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                    <Link href={n.href} className="block border-b border-ivory/5 py-4 font-display text-2xl text-ivory/90 hover:text-magenta">
                      {n.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto space-y-3 pt-6">
                <Link href={user ? "/account" : "/login"} className="btn-outline w-full">
                  {user ? `Hi, ${user.name.split(" ")[0]}` : "Login / Register"}
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function IconBtn({ href, onClick, label, className, children }: { href?: string; onClick?: () => void; label: string; className?: string; children: React.ReactNode }) {
  const cls = cn("flex h-10 w-10 items-center justify-center rounded-full text-ivory/85 transition hover:bg-ivory/5 hover:text-magenta", className);
  return href ? (
    <Link href={href} className={cls} aria-label={label}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={cls} aria-label={label}>
      {children}
    </button>
  );
}
