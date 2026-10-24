"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { api } from "@/lib/fetcher";
import { formatDate, formatINR } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  courier: string | null;
  trackingNumber: string | null;
  items: { id: string; name: string; image: string | null; price: number; quantity: number }[];
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api<{ orders: Order[] }>("/api/account/orders")
      .then((r) => setOrders(r.orders))
      .catch(() => setOrders([]));
  }, []);

  if (!orders) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-48" />
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="card p-12 text-center">
        <p className="font-display text-3xl">No orders yet</p>
        <p className="mt-2 text-sm text-ivory/55">Your sparkle story starts here.</p>
        <Link href="/shop" className="btn-gold mt-6">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((o, i) => (
        <motion.div key={o.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl text-gold">{o.orderNumber}</p>
              <p className="text-xs text-ivory/50">Placed on {formatDate(o.createdAt)}</p>
            </div>
            <p className="text-lg font-medium">{formatINR(o.total)}</p>
          </div>
          <OrderTimeline status={o.status} />
          {o.trackingNumber && (
            <p className="text-sm text-ivory/65">
              {o.courier} · Tracking: <span className="text-gold">{o.trackingNumber}</span>
            </p>
          )}
          <div className="flex gap-3 overflow-x-auto">
            {o.items.map((it) => (
              <div key={it.id} className="flex flex-shrink-0 items-center gap-3 rounded-xl bg-noir-700/60 p-2 pr-4">
                <img src={it.image || "/seed/hero.jpg"} alt="" className="h-14 w-12 rounded-lg object-cover" />
                <div className="text-xs">
                  <p className="max-w-[160px] truncate">{it.name}</p>
                  <p className="text-ivory/50">× {it.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
