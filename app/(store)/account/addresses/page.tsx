"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { api, FetchError } from "@/lib/fetcher";
import { useToast } from "@/components/providers/ToastProvider";
import { INDIAN_STATES } from "@/lib/utils";

type Address = { id: string; name: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string; isDefault: boolean };
const empty = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false };

export default function AddressesPage() {
  const toast = useToast();
  const [list, setList] = useState<Address[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = () => api<{ addresses: Address[] }>("/api/account/addresses").then((r) => setList(r.addresses));
  useEffect(() => {
    load().catch(() => setList([]));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/account/addresses", { body: form });
      toast("Address saved");
      setForm(empty);
      setAdding(false);
      setErrors({});
      await load();
    } catch (err) {
      if (err instanceof FetchError && err.fields) setErrors(err.fields);
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    await api(`/api/account/addresses/${id}`, { method: "DELETE" });
    await load();
  };
  const makeDefault = async (id: string) => {
    await api(`/api/account/addresses/${id}`, { method: "PATCH" });
    await load();
  };

  const input = (k: keyof typeof empty, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={String(form[k] ?? "")} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...extra} />
      {errors[k] && <p className="field-error">{errors[k]}</p>}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-3xl">Saved addresses</h2>
        <button onClick={() => setAdding((a) => !a)} className="btn-outline px-4 py-2">
          <Plus className="h-4 w-4" /> Add new
        </button>
      </div>

      <AnimatePresence>
        {adding && (
          <motion.form onSubmit={save} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8 overflow-hidden">
            <div className="card grid gap-4 p-6 sm:grid-cols-2">
              {input("name", "Full name")}
              {input("phone", "Mobile", { inputMode: "numeric", maxLength: 10 })}
              <div className="sm:col-span-2">{input("line1", "House / flat, street")}</div>
              <div className="sm:col-span-2">{input("line2", "Area, landmark (optional)")}</div>
              {input("city", "City")}
              {input("pincode", "PIN code", { inputMode: "numeric", maxLength: 6 })}
              <div className="sm:col-span-2">
                <label className="label">State</label>
                <select className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errors.state && <p className="field-error">{errors.state}</p>}
              </div>
              <label className="flex items-center gap-2 text-sm text-ivory/70">
                <input type="checkbox" className="accent-[#C2186B]" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> Make default
              </label>
              <div className="flex justify-end gap-3 sm:col-span-2">
                <button type="button" onClick={() => setAdding(false)} className="btn-ghost">Cancel</button>
                <button className="btn-gold" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save address</button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {!list ? (
        <div className="skeleton h-32" />
      ) : list.length === 0 ? (
        <p className="text-ivory/55">No saved addresses yet. They&apos;ll also be saved automatically when you check out.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <motion.div layout key={a.id} className="card relative p-5 text-sm">
              {a.isDefault && <span className="absolute right-4 top-4 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">Default</span>}
              <p className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 text-gold" />{a.name}</p>
              <p className="mt-2 text-ivory/60">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
              <p className="text-ivory/60">{a.city}, {a.state} – {a.pincode}</p>
              <p className="text-ivory/60">{a.phone}</p>
              <div className="mt-4 flex gap-4 text-xs uppercase tracking-wider">
                {!a.isDefault && (
                  <button onClick={() => makeDefault(a.id)} className="flex items-center gap-1 text-ivory/60 hover:text-magenta"><Star className="h-3.5 w-3.5" /> Set default</button>
                )}
                <button onClick={() => del(a.id)} className="flex items-center gap-1 text-ivory/60 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
