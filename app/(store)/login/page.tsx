"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/account/AuthCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { api, FetchError } from "@/lib/fetcher";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const { refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/auth/login", { body: form });
      const user = await refresh();
      toast(`Welcome back, ${user?.name.split(" ")[0] ?? ""} ✦`);
      router.replace(next.startsWith("/") ? next : "/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof FetchError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to track orders, save addresses and your wishlist.">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <div className="flex justify-between">
            <label className="label">Password</label>
            <Link href="/forgot-password" className="text-xs text-gold hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <input className="input pr-11" type={show ? "text" : "password"} required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-magenta" aria-label="Toggle password visibility">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <button className="btn-gold w-full py-4" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Log in
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-ivory/55">
        New to Urban Noor?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-gold hover:underline">Create an account</Link>
      </p>
      <p className="mt-3 text-center text-xs text-ivory/40">
        No account needed to shop — <Link href="/checkout" className="underline">checkout as guest</Link>.
      </p>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
