"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, Pager, TableShell, td, th, useAdminData } from "@/components/admin/ui";
import { formatDate, formatINR } from "@/lib/utils";

type Row = { id: string; name: string; email: string; phone: string | null; createdAt: string; orderCount: number; totalSpent: number };
type ListRes = { items: Row[]; total: number; page: number; totalPages: number };

export default function AdminCustomersPage() {
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

  const params = new URLSearchParams({ page: String(page) });
  if (debounced) params.set("q", debounced);
  const { data } = useAdminData<ListRes>(`/api/admin/customers?${params}`);

  return (
    <div>
      <PageHeader title="Customers" subtitle={data ? `${data.total} registered customers (guest buyers appear in Orders)` : undefined} />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/35" />
        <input className="admin-input pl-9" placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <TableShell>
        <thead className="border-b border-ivory/5">
          <tr>
            <th className={th}>Customer</th>
            <th className={th}>Phone</th>
            <th className={th}>Joined</th>
            <th className={th}>Orders</th>
            <th className={th}>Total spent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ivory/10">
          {!data
            ? [1, 2, 3].map((i) => <tr key={i}><td colSpan={5} className="p-3"><div className="skeleton h-10" /></td></tr>)
            : data.items.map((c) => (
                <tr key={c.id} className="hover:bg-ivory/[0.02]">
                  <td className={td}>
                    <p>{c.name}</p>
                    <p className="text-xs text-ivory/40">{c.email}</p>
                  </td>
                  <td className={`${td} text-ivory/60`}>{c.phone || "—"}</td>
                  <td className={`${td} text-ivory/60`}>{formatDate(c.createdAt)}</td>
                  <td className={td}>{c.orderCount}</td>
                  <td className={td}>{formatINR(c.totalSpent)}</td>
                </tr>
              ))}
          {data && data.items.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-ivory/45">No customers yet.</td></tr>}
        </tbody>
      </TableShell>
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </div>
  );
}
