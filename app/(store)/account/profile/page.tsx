"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { api } from "@/lib/fetcher";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || "" });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/api/auth/me", { method: "PUT", body: form });
      await refresh();
      toast("Profile updated");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="card max-w-xl space-y-5 p-6 sm:p-8">
      <h2 className="font-display text-3xl">Profile</h2>
      <div>
        <label className="label">Email</label>
        <input className="input opacity-60" value={user?.email || ""} disabled />
      </div>
      <div>
        <label className="label">Full name</label>
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <label className="label">Mobile</label>
        <input className="input" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} />
      </div>
      <button className="btn-gold" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
      </button>
      <p className="text-xs text-ivory/40">
        Want to change your password? Log out and use “Forgot password” on the login page.
      </p>
    </form>
  );
}
