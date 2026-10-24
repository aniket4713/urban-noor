"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthCard } from "@/components/account/AuthCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { api, FetchError } from "@/lib/fetcher";
import { registerSchema } from "@/lib/validators";

function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const { refresh } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path.join(".")] = i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/register", { body: parsed.data });
      await refresh();
      toast("Account created — welcome to Urban Noor ✦");
      router.replace(next.startsWith("/") ? next : "/account");
      router.refresh();
    } catch (err) {
      if (err instanceof FetchError && err.fields) setErrors(err.fields);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} {...props} />
      {errors[key] && <p className="field-error">{errors[key]}</p>}
    </div>
  );

  return (
    <AuthCard title="Join Urban Noor" subtitle="Get ₹100 off your first order with code WELCOME100.">
      <form onSubmit={submit} className="space-y-5">
        {field("name", "Full name", { autoComplete: "name", required: true })}
        {field("email", "Email", { type: "email", autoComplete: "email", required: true })}
        {field("phone", "Mobile (optional)", { inputMode: "numeric", maxLength: 10, autoComplete: "tel-national" })}
        {field("password", "Password (min 8 characters)", { type: "password", autoComplete: "new-password", required: true })}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <button className="btn-gold w-full py-4" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-ivory/55">
        Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-gold hover:underline">Log in</Link>
      </p>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
