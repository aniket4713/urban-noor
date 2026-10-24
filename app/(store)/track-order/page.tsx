"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { api } from "@/lib/fetcher";
import { formatDate, formatINR } from "@/lib/utils";

type Tracked = {
  orderNumber: string;
  status: string;
  createdAt: string;
  total: number;
  courier: string | null;
  trackingNumber: string | null;
  city: string;
  items: { name: string; image: string | null; price: number; quantity: number }[];
};

function TrackOrder() {
  const sp = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(sp.get("order") || "");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<Tracked | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setOrderNumber(sp.get("order") || ""), [sp]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await api<{ order: Tracked }>("/api/orders/track", { body: { orderNumber, contact } });
      setOrder(r.order);
    } catch (err) {
      setOrder(null);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x max-w-2xl py-16">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-3">Where&apos;s my sparkle?</p>
        <h1 className="font-display text-5xl">Track your order</h1>
        <p className="mt-3 text-sm text-ivory/55">Enter your order number and the email or phone used at checkout.</p>
      </div>

      <form onSubmit={submit} className="card grid gap-4 p-6 sm:grid-cols-[1fr_1fr_auto]">
        <input className="input" placeholder="Order no. e.g. UN2610AB12C" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} required />
        <input className="input" placeholder="Email or mobile" value={contact} onChange={(e) => setContact(e.target.value)} required />
        <button className="btn-gold" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Track
        </button>
      </form>
      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

      <AnimatePresence>
        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card mt-8 space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-ivory/40">Order</p>
                <p className="font-display text-2xl text-gold">{order.orderNumber}</p>
              </div>
              <div className="text-right text-sm text-ivory/60">
                Placed {formatDate(order.createdAt)}
                <br />
                Total {formatINR(order.total)}
              </div>
            </div>
            <OrderTimeline status={order.status} />
            {order.trackingNumber && (
              <p className="rounded-xl bg-gold/5 px-4 py-3 text-sm">
                {order.courier && <>Courier: <b>{order.courier}</b> · </>}Tracking no: <b className="text-gold">{order.trackingNumber}</b>
              </p>
            )}
            <ul className="divide-y divide-ivory/10">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-3 py-3 text-sm">
                  <img src={i.image || "/seed/hero.jpg"} alt="" className="h-12 w-10 rounded object-cover" />
                  <span className="flex-1">{i.name} × {i.quantity}</span>
                  <span>{formatINR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense>
      <TrackOrder />
    </Suspense>
  );
}
