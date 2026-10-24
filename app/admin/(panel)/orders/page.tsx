"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PageHeader, Pager, StatusBadge, TableShell, td, th, useAdminData } from "@/components/admin/ui";
import { cn, formatDate, formatINR, ORDER_STATUSES } from "@/lib/utils";

type Row = { id: string; orderNumber: string; customerName: string; email: string; phone: string; total: number; status: string; createdAt: string; userId: string | null; _count: { items: number } };
type ListRes = { items: Row[]; total: number; page: number; totalPages: number };

function OrdersList() {
  const sp = useSearchParams();
  const [status, setStatus] = useState(sp.get("status") || "ALL");
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = new URLSearchParams({ page: String(page), status });
  if (debounced) params.set("q", debounced);
  const { data } = useAdminData<ListRes>(`/api/admin/orders?${params}`);

  return (
    <div>
      <PageHeader title="Orders" subtitle={data ? `${data.total} orders` : undefined} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {["ALL", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={cn("rounded-full border px-3.5 py-1.5 text-xs uppercase tracking-wider transition", status === s ? "border-gold bg-brand text-white" : "border-ivory/10 text-ivory/60 hover:border-gold/50")}
          >
            {s}
          </button>
        ))}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/35" />
          <input className="admin-input pl-9" placeholder="Order no, name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <p className="mb-4 text-xs text-ivory/40">PENDING = customer started checkout but payment isn&apos;t confirmed. PAID = ready to pack &amp; ship.</p>

      <TableShell>
        <thead className="border-b border-ivory/5">
          <tr>
            <th className={th}>Order</th>
            <th className={th}>Customer</th>
            <th className={th}>Date</th>
            <th className={th}>Items</th>
            <th className={th}>Total</th>
            <th className={th}>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ivory/10">
          {!data
            ? [1, 2, 3].map((i) => <tr key={i}><td colSpan={6} className="p-3"><div className="skeleton h-10" /></td></tr>)
            : data.items.map((o) => (
                <tr key={o.id} className="cursor-pointer hover:bg-ivory/[0.03]">
                  <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs text-gold hover:underline">{o.orderNumber}</Link></td>
                  <td className={td}>
                    <Link href={`/admin/orders/${o.id}`} className="block">
                      <p>{o.customerName} {!o.userId && <span className="ml-1 rounded bg-ivory/10 px-1.5 py-0.5 text-[10px] text-ivory/50">Guest</span>}</p>
                      <p className="text-xs text-ivory/40">{o.email}</p>
                    </Link>
                  </td>
                  <td className={`${td} text-ivory/60`}>{formatDate(o.createdAt)}</td>
                  <td className={td}>{o._count.items}</td>
                  <td className={td}>{formatINR(o.total)}</td>
                  <td className={td}><StatusBadge status={o.status} /></td>
                </tr>
              ))}
          {data && data.items.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-ivory/45">No orders found.</td></tr>}
        </tbody>
      </TableShell>
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  );
}
