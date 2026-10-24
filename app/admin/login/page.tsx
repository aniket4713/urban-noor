"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/fetcher";

function AdminLoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/auth/login", { body: { ...form, admin: true } });
      await refresh();
      const next = sp.get("next");
      router.replace(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(194,24,107,0.12),transparent_55%)]" />
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-sm space-y-5 rounded-3xl border border-gold/20 bg-noir-800/90 p-8 shadow-card backdrop-blur">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-gold">
            <Lock className="h-6 w-6" />
          </div>
          <p className="gold-text font-display text-2xl tracking-[0.3em]">URBAN NOOR</p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-ivory/45">Admin Panel</p>
        </div>
        <input className="input" type="email" placeholder="Admin email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <button className="btn-gold w-full py-3.5" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
      </motion.form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
