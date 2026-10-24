"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, MapPin, Phone, Printer } from "lucide-react";
import { Field, StatusBadge, useAdminData } from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { api } from "@/lib/fetcher";
import { formatDate, formatINR, ORDER_STATUSES } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  email: string;
  phone: string;
  shipName: string;
  shipPhone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode: string | null;
  courier: string | null;
  trackingNumber: string | null;
  razorpayOrderId: string | null;
  paidAt: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
  items: { id: string; name: string; image: string | null; price: number; quantity: number; productId: string | null }[];
  payments: { id: string; razorpayPaymentId: string | null; status: string; method: string | null; amount: number; errorReason: string | null; createdAt: string }[];
};

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const toast = useToast();
  const { data, setData } = useAdminData<{ order: Order }>(`/api/admin/orders/${params.id}`);
  const [form, setForm] = useState({ status: "", courier: "", trackingNumber: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm({ status: data.order.status, courier: data.order.courier ?? "", trackingNumber: data.order.trackingNumber ?? "" });
  }, [data]);

  if (!data) return <div className="skeleton h-96" />;
  const o = data.order;

  const save = async () => {
    if (form.status === "SHIPPED" && !form.trackingNumber && !confirm("Mark as shipped without a tracking number?")) return;
    setSaving(true);
    try {
      const r = await api<{ order: Order }>(`/api/admin/orders/${o.id}`, { method: "PATCH", body: form });
      setData(r);
      toast(form.status !== o.status ? `Order marked ${form.status} — customer emailed` : "Order updated");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders" className="rounded-full p-2 hover:bg-ivory/5" aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="flex items-center gap-3 font-display text-3xl">{o.orderNumber} <StatusBadge status={o.status} /></h1>
            <p className="text-xs text-ivory/45">Placed {formatDate(o.createdAt)} {o.paidAt && `· Paid ${formatDate(o.paidAt)}`}</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="btn-outline px-4 py-2"><Printer className="h-4 w-4" /> Print</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-ivory/5 bg-noir-800 p-6">
            <h2 className="mb-4 text-sm uppercase tracking-wider text-ivory/55">Items</h2>
            <ul className="divide-y divide-ivory/10">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <img src={i.image || "/seed/hero.jpg"} alt="" className="h-14 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    {i.productId ? <Link href={`/admin/products/${i.productId}`} className="hover:text-magenta">{i.name}</Link> : i.name}
                    <p className="text-xs text-ivory/45">{formatINR(i.price)} × {i.quantity}</p>
                  </div>
                  <span>{formatINR(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-ivory/5 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ivory/55">Subtotal</dt><dd>{formatINR(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ivory/55">Shipping</dt><dd>{o.shippingFee ? formatINR(o.shippingFee) : "Free"}</dd></div>
              {o.discount > 0 && <div className="flex justify-between"><dt className="text-ivory/55">Discount {o.couponCode && `(${o.couponCode})`}</dt><dd className="text-emerald-700">−{formatINR(o.discount)}</dd></div>}
              <div className="flex justify-between pt-2 font-display text-xl"><dt>Total</dt><dd className="text-gold">{formatINR(o.total)}</dd></div>
            </dl>
          </section>

          <section className="rounded-2xl border border-ivory/5 bg-noir-800 p-6">
            <h2 className="mb-4 text-sm uppercase tracking-wider text-ivory/55">Payments (Razorpay)</h2>
            <p className="mb-3 font-mono text-xs text-ivory/45">Razorpay order: {o.razorpayOrderId ?? "—"}</p>
            {o.payments.length === 0 ? (
              <p className="text-sm text-ivory/45">No payment attempts yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {o.payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-noir-900 px-3 py-2">
                    <StatusBadge status={p.status} />
                    <span className="font-mono text-xs">{p.razorpayPaymentId ?? "(awaiting payment)"}</span>
                    {p.method && <span className="text-xs uppercase text-ivory/50">{p.method}</span>}
                    <span className="ml-auto">{formatINR(p.amount / 100)}</span>
                    {p.errorReason && <span className="w-full text-xs text-red-600">{p.errorReason}</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-gold/20 bg-noir-800 p-6">
            <h2 className="text-sm uppercase tracking-wider text-gold">Fulfilment</h2>
            <Field label="Status">
              <select className="admin-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Courier">
              <input className="admin-input" placeholder="Delhivery, Blue Dart, India Post…" value={form.courier} onChange={(e) => setForm({ ...form, courier: e.target.value })} />
            </Field>
            <Field label="Tracking number">
              <input className="admin-input" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} />
            </Field>
            <button onClick={save} className="btn-gold w-full" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Update order
            </button>
            <p className="text-[11px] text-ivory/40">Changing status to Shipped, Delivered or Cancelled emails the customer automatically.</p>
          </section>

          <section className="space-y-2 rounded-2xl border border-ivory/5 bg-noir-800 p-6 text-sm">
            <h2 className="mb-2 text-sm uppercase tracking-wider text-ivory/55">Customer</h2>
            <p className="font-medium">{o.customerName} {o.user ? <span className="text-xs text-gold">(registered)</span> : <span className="text-xs text-ivory/40">(guest)</span>}</p>
            <a href={`mailto:${o.email}`} className="flex items-center gap-2 text-ivory/65 hover:text-magenta"><Mail className="h-4 w-4" />{o.email}</a>
            <a href={`tel:${o.phone}`} className="flex items-center gap-2 text-ivory/65 hover:text-magenta"><Phone className="h-4 w-4" />{o.phone}</a>
          </section>

          <section className="rounded-2xl border border-ivory/5 bg-noir-800 p-6 text-sm">
            <h2 className="mb-2 flex items-center gap-2 text-sm uppercase tracking-wider text-ivory/55"><MapPin className="h-4 w-4" /> Ship to</h2>
            <p className="font-medium">{o.shipName}</p>
            <p className="text-ivory/65">{o.line1}</p>
            {o.line2 && <p className="text-ivory/65">{o.line2}</p>}
            <p className="text-ivory/65">{o.city}, {o.state} – {o.pincode}</p>
            <p className="text-ivory/65">{o.shipPhone}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
