"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, LogOut, MapPin, Package, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/profile", label: "Profile", icon: User },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="container-x py-12">
      <div className="mb-10">
        <p className="eyebrow mb-2">My account</p>
        <h1 className="font-display text-5xl">Hello{user ? `, ${user.name.split(" ")[0]}` : ""} ✦</h1>
      </div>
      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link key={n.href} href={n.href} className={cn("relative flex flex-shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm transition", active ? "text-white" : "text-ivory/70 hover:text-magenta")}>
                {active && <motion.span layoutId="account-nav" className="absolute inset-0 rounded-xl bg-brand" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <n.icon className="relative h-4 w-4" />
                <span className="relative">{n.label}</span>
              </Link>
            );
          })}
          <button
            onClick={async () => {
              await logout();
              router.push("/");
              router.refresh();
            }}
            className="flex flex-shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm text-ivory/50 transition hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
