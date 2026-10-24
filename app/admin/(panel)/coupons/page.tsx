"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Field, Modal, PageHeader, TableShell, Toggle, td, th, useAdminData } from "@/components/admin/ui";
import { useToast } from "@/components/providers/ToastProvider";
import { api } from "@/lib/fetcher";
import { formatDate, formatINR } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
};

type FormState = { code: string; type: "PERCENT" | "FLAT"; value: string; minOrder: string; maxDiscount: string; usageLimit: string; expiresAt: string; isActive: boolean };
const empty: FormState = { code: "", type: "PERCENT", value: "10", minOrder: "0", maxDiscount: "", usageLimit: "", expiresAt: "", isActive: true };

export default function AdminCouponsPage() {
  const toast = useToast();
  const { data, reload } = useAdminData<{ coupons: Coupon[] }>("/api/admin/coupons");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [f, setF] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const openEdit = (c: Coupon | null) => {
    setEditing(c);
    setF(
      c
        ? {
            code: c.code,
            type: c.type,
            value: String(c.value),
            minOrder: String(c.minOrder),
            maxDiscount: c.maxDiscount ? String(c.maxDiscount) : "",
            usageLimit: c.usageLimit ? String(c.usageLimit) : "",
            expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
            isActive: c.isActive,
          }
        : empty
    );
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      code: f.code,
      type: f.type,
      value: Number(f.value),
      minOrder: Number(f.minOrder || 0),
      maxDiscount: f.maxDiscount ? Number(f.maxDiscount) : null,
      usageLimit: f.usageLimit ? Number(f.usageLimit) : null,
      expiresAt: f.expiresAt ? new Date(`${f.expiresAt}T23:59:59`).toISOString() : null,
      isActive: f.isActive,
    };
    try {
      if (editing) await api(`/api/admin/coupons/${editing.id}`, { method: "PUT", body });
      else await api("/api/admin/coupons", { body });
      toast("Coupon saved");
      setOpen(false);
      reload();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const del = async (c: Coupon) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await api(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    reload();
  };

  const num = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value.replace(/\D/g, "") });

  return (
    <div>
      <PageHeader title="Coupons" action={<button onClick={() => openEdit(null)} className="btn-gold"><Plus className="h-4 w-4" /> New coupon</button>} />
      <TableShell>
        <thead className="border-b border-ivory/5">
          <tr>
            <th className={th}>Code</th>
            <th className={th}>Discount</th>
            <th className={th}>Min order</th>
            <th className={th}>Used</th>
            <th className={th}>Expires</th>
            <th className={th}>Status</th>
            <th className={`${th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ivory/10">
          {data?.coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            return (
              <tr key={c.id}>
                <td className={`${td} font-mono text-gold`}>{c.code}</td>
                <td className={td}>
                  {c.type === "PERCENT" ? `${c.value}%` : formatINR(c.value)}
                  {c.maxDiscount && <span className="text-xs text-ivory/40"> (max {formatINR(c.maxDiscount)})</span>}
                </td>
                <td className={td}>{c.minOrder ? formatINR(c.minOrder) : "—"}</td>
                <td className={td}>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</td>
                <td className={`${td} text-ivory/60`}>{c.expiresAt ? formatDate(c.expiresAt) : "Never"}</td>
                <td className={td}>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${c.isActive && !expired ? "bg-emerald-500/15 text-emerald-700" : "bg-ivory/10 text-ivory/50"}`}>
                    {expired ? "Expired" : c.isActive ? "Active" : "Off"}
                  </span>
                </td>
                <td className={`${td} text-right`}>
                  <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-ivory/60 hover:text-magenta" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(c)} className="rounded-lg p-2 text-ivory/60 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            );
          })}
          {data && data.coupons.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-ivory/45">No coupons yet.</td></tr>}
        </tbody>
      </TableShell>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${editing.code}` : "New coupon"}>
        <form onSubmit={save} className="grid grid-cols-2 gap-4">
          <Field label="Code" className="col-span-2">
            <input className="admin-input font-mono uppercase" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })} required />
          </Field>
          <Field label="Type">
            <select className="admin-input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as FormState["type"] })}>
              <option value="PERCENT">Percentage %</option>
              <option value="FLAT">Flat ₹</option>
            </select>
          </Field>
          <Field label={f.type === "PERCENT" ? "Percent off" : "Amount off (₹)"}>
            <input className="admin-input" value={f.value} onChange={num("value")} required />
          </Field>
          <Field label="Minimum order (₹)">
            <input className="admin-input" value={f.minOrder} onChange={num("minOrder")} />
          </Field>
          <Field label="Max discount (₹)" hint="Optional cap for % coupons">
            <input className="admin-input" value={f.maxDiscount} onChange={num("maxDiscount")} />
          </Field>
          <Field label="Usage limit" hint="Leave empty for unlimited">
            <input className="admin-input" value={f.usageLimit} onChange={num("usageLimit")} />
          </Field>
          <Field label="Expires on">
            <input className="admin-input" type="date" value={f.expiresAt} onChange={(e) => setF({ ...f, expiresAt: e.target.value })} />
          </Field>
          <div className="col-span-2"><Toggle checked={f.isActive} onChange={(v) => setF({ ...f, isActive: v })} label="Active" /></div>
          <button className="btn-gold col-span-2" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save coupon</button>
        </form>
      </Modal>
    </div>
  );
}
