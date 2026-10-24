"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, FolderTree, Gem, LayoutDashboard, LogOut, Menu, Settings, ShoppingCart, Ticket, Users, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Gem },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/settings", label: "Store Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="mb-10 block px-3">
        <p className="gold-text font-display text-xl tracking-[0.25em]">URBAN NOOR</p>
        <p className="text-[10px] uppercase tracking-[0.35em] text-ivory/40">Admin</p>
      </Link>
      <nav className="flex-1 space-y-1">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition", isActive(n.href) ? "text-white" : "text-ivory/65 hover:bg-ivory/5 hover:text-ivory")}>
            {isActive(n.href) && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-brand" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <n.icon className="relative h-4 w-4" />
            <span className="relative">{n.label}</span>
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-ivory/5 pt-4">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivory/60 hover:text-magenta">
          <ExternalLink className="h-4 w-4" /> View store
        </a>
        <button
          onClick={async () => {
            await logout();
            router.push("/admin/login");
            router.refresh();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivory/60 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
        {user && <p className="truncate px-3 pt-2 text-[11px] text-ivory/35">{user.email}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-noir-900">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-ivory/5 bg-noir-800 p-4 lg:block">{sidebar}</aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/70 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-64 bg-noir-800 p-4 lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <button onClick={() => setOpen(false)} className="absolute right-4 top-4" aria-label="Close menu"><X className="h-5 w-5" /></button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-ivory/5 bg-noir-900/80 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <span className="ml-4 font-display text-lg tracking-widest text-gold">ADMIN</span>
        </header>
        <motion.main key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mx-auto max-w-7xl p-4 sm:p-8">
          {children}
        </motion.main>
      </div>
    </div>
  );
}
