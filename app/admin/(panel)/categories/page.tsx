"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Field, Modal, PageHeader, useAdminData } from "@/components/admin/ui";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/providers/ToastProvider";
import { api } from "@/lib/fetcher";
import { slugify } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string; description: string | null; image: string | null; sortOrder: number; _count: { products: number } };
const empty = { name: "", slug: "", description: "", image: "", sortOrder: 0 };

export default function AdminCategoriesPage() {
  const toast = useToast();
  const { data, reload } = useAdminData<{ categories: Cat[] }>("/api/admin/categories");
  const [editing, setEditing] = useState<Cat | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (c: Cat) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description ?? "", image: c.image ?? "", sortOrder: c.sortOrder });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api(`/api/admin/categories/${editing.id}`, { method: "PUT", body: form });
      else await api("/api/admin/categories", { body: form });
      toast(editing ? "Category updated" : "Category created");
      setOpen(false);
      reload();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const del = async (c: Cat) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      toast("Category deleted");
      reload();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  return (
    <div>
      <PageHeader title="Categories" action={<button onClick={openNew} className="btn-gold"><Plus className="h-4 w-4" /> Add category</button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!data
          ? [1, 2, 3].map((i) => <div key={i} className="skeleton h-28" />)
          : data.categories.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-4 rounded-2xl border border-ivory/5 bg-noir-800 p-4">
                <img src={c.image || "/seed/hero.jpg"} alt="" className="h-16 w-16 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="font-display text-xl">{c.name}</p>
                  <p className="text-xs text-ivory/45">/{c.slug} · {c._count.products} products · order {c.sortOrder}</p>
                </div>
                <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-ivory/60 hover:bg-ivory/5 hover:text-magenta" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(c)} className="rounded-lg p-2 text-ivory/60 hover:bg-ivory/5 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </motion.div>
            ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit category" : "New category"}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Name">
            <input className="admin-input" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} />
          </Field>
          <Field label="Slug">
            <input className="admin-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
          </Field>
          <Field label="Description (optional)">
            <textarea className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Display order" hint="Lower numbers show first">
            <input className="admin-input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </Field>
          <Field label="Image">
            <ImageUploader value={form.image ? [form.image] : []} onChange={(u) => setForm({ ...form, image: u[0] ?? "" })} max={1} folder="categories" />
          </Field>
          <button className="btn-gold w-full" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />} Save</button>
        </form>
      </Modal>
    </div>
  );
}
