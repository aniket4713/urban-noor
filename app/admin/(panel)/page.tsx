"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, IndianRupee, Package, ShoppingBag, Truck, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, StatusBadge, useAdminData } from "@/components/admin/ui";
import { formatDate, formatINR } from "@/lib/utils";

type Stats = {
  totalRevenue: number;
  ordersToday: number;
  totalOrders: number;
  pendingToShip: number;
  customers: number;
  lowStock: { id: string; name: string; stock: number }[];
  recentOrders: { id: string; orderNumber: string; customerName: string; total: number; status: string; createdAt: string }[];
  sales: { date: string; revenue: number; orders: number }[];
};

export default function DashboardPage() {
  const { data, error } = useAdminData<Stats>("/api/admin/dashboard");

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28" />)}
        <div className="skeleton h-80 sm:col-span-2 lg:col-span-4" />
      </div>
    );
  }

  const cards = [
    { label: "Total revenue", value: formatINR(data.totalRevenue), icon: IndianRupee },
    { label: "Orders today", value: data.ordersToday, icon: ShoppingBag },
    { label: "Total orders", value: data.totalOrders, icon: Package },
    { label: "Waiting to ship", value: data.pendingToShip, icon: Truck, href: "/admin/orders?status=PAID" },
    { label: "Customers", value: data.customers, icon: Users },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Here's how Urban Noor is shining today." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c, i) => {
          const inner = (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-2xl border border-ivory/5 bg-noir-800 p-5 transition hover:border-gold/30">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-ivory/45">{c.label}</span>
                <c.icon className="h-4 w-4 text-gold" />
              </div>
              <p className="mt-3 font-display text-3xl">{c.value}</p>
            </motion.div>
          );
          return c.href ? <Link key={c.label} href={c.href}>{inner}</Link> : <div key={c.label}>{inner}</div>;
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-ivory/5 bg-noir-800 p-5">
        <h2 className="mb-4 text-sm uppercase tracking-wider text-ivory/55">Sales — last 30 days</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.sales} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C2186B" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#7B2FBE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(43,18,56,0.06)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "rgba(43,18,56,.5)", fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: "rgba(43,18,56,.5)", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} width={48} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid rgba(194,24,107,.25)", borderRadius: 12, color: "#2B1238" }}
                formatter={(v, name) => (name === "revenue" ? [formatINR(Number(v)), "Revenue"] : [v, "Orders"])}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C2186B" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-ivory/5 bg-noir-800 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-wider text-ivory/55">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs text-gold hover:underline">View all</Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-ivory/45">No orders yet — they&apos;ll appear here after the first payment.</p>
          ) : (
            <ul className="divide-y divide-ivory/10">
              {data.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/orders/${o.id}`} className="flex items-center gap-4 py-3 text-sm hover:text-magenta">
                    <span className="w-32 font-mono text-xs">{o.orderNumber}</span>
                    <span className="flex-1 truncate">{o.customerName}</span>
                    <span className="hidden text-ivory/45 sm:block">{formatDate(o.createdAt)}</span>
                    <StatusBadge status={o.status} />
                    <span className="w-20 text-right">{formatINR(o.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-ivory/5 bg-noir-800 p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-ivory/55">
            <AlertTriangle className="h-4 w-4 text-amber-700" /> Low stock
          </h2>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-ivory/45">All products are well stocked ✦</p>
          ) : (
            <ul className="space-y-2">
              {data.lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-ivory/5">
                    <span className="truncate">{p.name}</span>
                    <span className={p.stock === 0 ? "text-red-600" : "text-amber-700"}>{p.stock} left</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
