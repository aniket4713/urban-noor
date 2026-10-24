"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Field, Toggle, useAdminData } from "./ui";
import { ImageUploader } from "./ImageUploader";
import { useToast } from "@/components/providers/ToastProvider";
import { api, FetchError } from "@/lib/fetcher";
import { discountPercent, formatINR, slugify } from "@/lib/utils";

export type ProductFormValue = {
  name: string;
  slug: string;
  description: string;
  gender: "MEN" | "WOMEN" | "UNISEX";
  categoryId: string;
  price: string;
  mrp: string;
  stock: string;
  sku: string;
  material: string;
  tags: string[];
  images: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
};

export const emptyProduct: ProductFormValue = {
  name: "",
  slug: "",
  description: "",
  gender: "WOMEN",
  categoryId: "",
  price: "",
  mrp: "",
  stock: "10",
  sku: "",
  material: "",
  tags: [],
  images: [],
  isFeatured: false,
  isNewArrival: true,
  isBestSeller: false,
  isActive: true,
};

export function ProductForm({ initial, productId }: { initial: ProductFormValue; productId?: string }) {
  const router = useRouter();
  const toast = useToast();
  const { data: cats } = useAdminData<{ categories: { id: string; name: string }[] }>("/api/admin/categories");
  const [v, setV] = useState<ProductFormValue>(initial);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(Boolean(productId));

  const set = <K extends keyof ProductFormValue>(k: K, val: ProductFormValue[K]) => setV((p) => ({ ...p, [k]: val }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const body = { ...v, price: Number(v.price), mrp: Number(v.mrp || v.price), stock: Number(v.stock) };
      if (productId) {
        await api(`/api/admin/products/${productId}`, { method: "PUT", body });
        toast("Product updated ✦");
      } else {
        await api("/api/admin/products", { body });
        toast("Product created ✦");
      }
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      if (err instanceof FetchError && err.fields) setErrors(err.fields);
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !v.tags.includes(t)) set("tags", [...v.tags, t]);
    setTagInput("");
  };

  const off = discountPercent(Number(v.price), Number(v.mrp));
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;

  return (
    <form onSubmit={save}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="rounded-full p-2 hover:bg-ivory/5" aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="font-display text-4xl">{productId ? "Edit product" : "New product"}</h1>
        </div>
        <button className="btn-gold" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {productId ? "Save changes" : "Create product"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-ivory/5 bg-noir-800 p-6">
            <Field label="Product name">
              <input
                className="admin-input"
                value={v.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value));
                }}
                required
              />
              {err("name")}
            </Field>
            <Field label="URL slug" hint={`urbannoor.in/product/${v.slug || "…"}`}>
              <input
                className="admin-input"
                value={v.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Description">
              <textarea className="admin-input min-h-[140px]" value={v.description} onChange={(e) => set("description", e.target.value)} required />
              {err("description")}
            </Field>
          </section>

          <section className="rounded-2xl border border-ivory/5 bg-noir-800 p-6">
            <h2 className="mb-4 text-sm uppercase tracking-wider text-ivory/55">Images</h2>
            <ImageUploader value={v.images} onChange={(imgs) => set("images", imgs)} />
          </section>

          <section className="grid gap-4 rounded-2xl border border-ivory/5 bg-noir-800 p-6 sm:grid-cols-3">
            <Field label="Selling price (₹)">
              <input className="admin-input" inputMode="numeric" value={v.price} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} required />
              {err("price")}
            </Field>
            <Field label="MRP (₹)" hint={off ? `Shows as ${off}% off` : "Leave equal to price for no discount"}>
              <input className="admin-input" inputMode="numeric" value={v.mrp} onChange={(e) => set("mrp", e.target.value.replace(/\D/g, ""))} />
              {err("mrp")}
            </Field>
            <Field label="Stock">
              <input className="admin-input" inputMode="numeric" value={v.stock} onChange={(e) => set("stock", e.target.value.replace(/\D/g, ""))} required />
            </Field>
            <Field label="SKU">
              <input className="admin-input" value={v.sku} onChange={(e) => set("sku", e.target.value)} />
              {err("sku")}
            </Field>
            <Field label="Material" className="sm:col-span-2">
              <input className="admin-input" value={v.material} onChange={(e) => set("material", e.target.value)} placeholder="e.g. 18K gold-plated brass, kundan stones" />
            </Field>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-ivory/5 bg-noir-800 p-6">
            <h2 className="text-sm uppercase tracking-wider text-ivory/55">Organisation</h2>
            <Field label="Collection">
              <select className="admin-input" value={v.gender} onChange={(e) => set("gender", e.target.value as ProductFormValue["gender"])}>
                <option value="WOMEN">Women</option>
                <option value="MEN">Men</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </Field>
            <Field label="Category">
              <select className="admin-input" value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
                <option value="">Select…</option>
                {cats?.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {err("categoryId")}
            </Field>
            <Field label="Tags" hint="Press Enter to add. Helps search.">
              <div className="flex flex-wrap gap-1.5 rounded-lg border border-ivory/10 bg-noir-900 p-2">
                {v.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                    {t}
                    <button type="button" onClick={() => set("tags", v.tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>×</button>
                  </span>
                ))}
                <input
                  className="min-w-[80px] flex-1 bg-transparent text-sm outline-none"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                />
              </div>
            </Field>
          </section>

          <section className="space-y-4 rounded-2xl border border-ivory/5 bg-noir-800 p-6">
            <h2 className="text-sm uppercase tracking-wider text-ivory/55">Visibility</h2>
            <Toggle checked={v.isActive} onChange={(x) => set("isActive", x)} label="Active (visible in store)" />
            <Toggle checked={v.isNewArrival} onChange={(x) => set("isNewArrival", x)} label="New arrival" />
            <Toggle checked={v.isBestSeller} onChange={(x) => set("isBestSeller", x)} label="Best seller" />
            <Toggle checked={v.isFeatured} onChange={(x) => set("isFeatured", x)} label="Featured" />
          </section>

          {v.images[0] && (
            <section className="rounded-2xl border border-ivory/5 bg-noir-800 p-4">
              <p className="mb-3 text-xs uppercase tracking-wider text-ivory/45">Card preview</p>
              <img src={v.images[0]} alt="" className="aspect-[4/5] w-full rounded-xl object-cover" />
              <p className="mt-3 font-display text-lg">{v.name || "Product name"}</p>
              <p className="text-sm text-gold">
                {v.price ? formatINR(Number(v.price)) : "₹—"}
                {off > 0 && <span className="ml-2 text-xs text-ivory/40 line-through">{formatINR(Number(v.mrp))}</span>}
              </p>
            </section>
          )}
        </aside>
      </div>
    </form>
  );
}
