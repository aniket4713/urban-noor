"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Field, PageHeader, useAdminData } from "@/components/admin/ui";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useToast } from "@/components/providers/ToastProvider";
import { api, FetchError } from "@/lib/fetcher";

type Settings = {
  tagline: string;
  announcement: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  shippingFee: number;
  freeShippingThreshold: number;
  whatsappNumber: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  instagramUrl: string;
  facebookUrl: string;
};

export default function AdminSettingsPage() {
  const toast = useToast();
  const { data } = useAdminData<{ settings: Settings }>("/api/admin/settings");
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setS(data.settings);
  }, [data]);

  if (!s) return <div className="skeleton h-96" />;

  const text = (k: keyof Settings) => ({
    value: String(s[k] ?? ""),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value }),
  });
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api("/api/admin/settings", { method: "PUT", body: { ...s, shippingFee: Number(s.shippingFee), freeShippingThreshold: Number(s.freeShippingThreshold) } });
      toast("Settings saved — the store is updated");
    } catch (err) {
      if (err instanceof FetchError && err.fields) setErrors(err.fields);
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <PageHeader
        title="Store settings"
        action={<button className="btn-gold" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save settings</button>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-ivory/5 bg-noir-800 p-6">
          <h2 className="text-sm uppercase tracking-wider text-gold">Homepage</h2>
          <Field label="Hero title"><input className="admin-input" {...text("heroTitle")} /></Field>
          <Field label="Hero subtitle"><textarea className="admin-input" {...text("heroSubtitle")} /></Field>
          <Field label="Hero image">
            <ImageUploader value={s.heroImage ? [s.heroImage] : []} onChange={(u) => setS({ ...s, heroImage: u[0] ?? "" })} max={1} folder="banners" />
            {err("heroImage")}
          </Field>
          <Field label="Tagline"><input className="admin-input" {...text("tagline")} /></Field>
          <Field label="Announcement bar" hint="Separate messages with ✦"><textarea className="admin-input" {...text("announcement")} /></Field>
        </section>

        <div className="space-y-6">
          <section className="grid gap-4 rounded-2xl border border-ivory/5 bg-noir-800 p-6 sm:grid-cols-2">
            <h2 className="text-sm uppercase tracking-wider text-gold sm:col-span-2">Shipping</h2>
            <Field label="Shipping fee (₹)">
              <input className="admin-input" inputMode="numeric" value={s.shippingFee} onChange={(e) => setS({ ...s, shippingFee: Number(e.target.value.replace(/\D/g, "")) })} />
            </Field>
            <Field label="Free shipping above (₹)">
              <input className="admin-input" inputMode="numeric" value={s.freeShippingThreshold} onChange={(e) => setS({ ...s, freeShippingThreshold: Number(e.target.value.replace(/\D/g, "")) })} />
            </Field>
          </section>

          <section className="space-y-4 rounded-2xl border border-ivory/5 bg-noir-800 p-6">
            <h2 className="text-sm uppercase tracking-wider text-gold">Contact & social</h2>
            <Field label="WhatsApp number" hint="Country code + number, digits only — e.g. 919876543210">
              <input className="admin-input" {...text("whatsappNumber")} />
              {err("whatsappNumber")}
            </Field>
            <Field label="Contact email"><input className="admin-input" {...text("contactEmail")} />{err("contactEmail")}</Field>
            <Field label="Contact phone"><input className="admin-input" {...text("contactPhone")} /></Field>
            <Field label="Address"><input className="admin-input" {...text("address")} /></Field>
            <Field label="Instagram URL"><input className="admin-input" {...text("instagramUrl")} /></Field>
            <Field label="Facebook URL"><input className="admin-input" {...text("facebookUrl")} /></Field>
          </section>
        </div>
      </div>
    </form>
  );
}
