"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader, Pager, TableShell, td, th, useAdminData } from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { api } from "@/lib/fetcher";
import { formatINR, GENDER_LABEL } from "@/lib/utils";

type Row = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  stock: number;
  gender: string;
  isActive: boolean;
  category: { name: string };
  images: { url: string }[];
};
type ListRes = { items: Row[]; total: number; page: number; totalPages: number };

export default function AdminProductsPage() {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("");
  const [gender, setGender] = useState("");
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
  if (status) params.set("status", status);
  if (gender) params.set("gender", gender);
  const { data, reload } = useAdminData<ListRes>(`/api/admin/products?${params}`);

  const del = async (r: Row) => {
    if (!confirm(`Delete "${r.name}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/products/${r.id}`, { method: "DELETE" });
      toast("Product deleted");
      reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  const duplicate = async (r: Row) => {
    try {
      const { product } = await api<{ product: { id: string } }>(`/api/admin/products/${r.id}/duplicate`, { method: "POST" });
      toast("Duplicated as a hidden draft");
      router.push(`/admin/products/${product.id}`);
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={data ? `${data.total} products` : undefined}
        action={
          <Link href="/admin/products/new" className="btn-gold">
            <Plus className="h-4 w-4" /> Add product
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/35" />
          <input className="admin-input pl-9" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="admin-input w-auto" value={gender} onChange={(e) => { setGender(e.target.value); setPage(1); }}>
          <option value="">All collections</option>
          <option value="WOMEN">Women</option>
          <option value="MEN">Men</option>
          <option value="UNISEX">Unisex</option>
        </select>
        <select className="admin-input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
          <option value="lowstock">Low stock (≤5)</option>
        </select>
      </div>

      <TableShell>
        <thead className="border-b border-ivory/5">
          <tr>
            <th className={th}>Product</th>
            <th className={th}>Category</th>
            <th className={th}>Price</th>
            <th className={th}>Stock</th>
            <th className={th}>Status</th>
            <th className={`${th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ivory/10">
          {!data
            ? [1, 2, 3, 4].map((i) => (
                <tr key={i}><td colSpan={6} className="p-3"><div className="skeleton h-10" /></td></tr>
              ))
            : data.items.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-ivory/[0.02]">
                  <td className={td}>
                    <Link href={`/admin/products/${r.id}`} className="flex items-center gap-3 hover:text-magenta">
                      <img src={r.images[0]?.url || "/seed/hero.jpg"} alt="" className="h-12 w-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs text-ivory/40">{GENDER_LABEL[r.gender]}</p>
                      </div>
                    </Link>
                  </td>
                  <td className={`${td} text-ivory/60`}>{r.category.name}</td>
                  <td className={td}>
                    {formatINR(r.price)}
                    {r.mrp > r.price && <span className="ml-1 text-xs text-ivory/35 line-through">{formatINR(r.mrp)}</span>}
                  </td>
                  <td className={td}>
                    <span className={r.stock === 0 ? "text-red-600" : r.stock <= 5 ? "text-amber-700" : ""}>{r.stock}</span>
                  </td>
                  <td className={td}>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${r.isActive ? "bg-emerald-500/15 text-emerald-700" : "bg-ivory/10 text-ivory/50"}`}>
                      {r.isActive ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className={`${td} text-right`}>
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/products/${r.id}`} className="rounded-lg p-2 text-ivory/60 hover:bg-ivory/5 hover:text-magenta" title="Edit"><Pencil className="h-4 w-4" /></Link>
                      <button onClick={() => duplicate(r)} className="rounded-lg p-2 text-ivory/60 hover:bg-ivory/5 hover:text-magenta" title="Duplicate"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => del(r)} className="rounded-lg p-2 text-ivory/60 hover:bg-ivory/5 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
          {data && data.items.length === 0 && (
            <tr><td colSpan={6} className="py-12 text-center text-ivory/45">No products found.</td></tr>
          )}
        </tbody>
      </TableShell>
      {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
    </div>
  );
}
