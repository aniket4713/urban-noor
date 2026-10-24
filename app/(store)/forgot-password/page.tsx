"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import { AuthCard } from "@/components/account/AuthCard";
import { api } from "@/lib/fetcher";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/auth/forgot-password", { body: { email } });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Forgot password?" subtitle="We'll email you a link to reset it.">
      {sent ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 text-center">
          <MailCheck className="mx-auto h-12 w-12 text-gold" />
          <p className="mt-4 text-ivory/80">If an account exists for <b>{email}</b>, a reset link is on its way. It expires in 30 minutes.</p>
          <Link href="/login" className="btn-outline mt-6">Back to login</Link>
        </motion.div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-gold w-full py-4" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
          </button>
          <p className="text-center text-sm">
            <Link href="/login" className="text-gold hover:underline">Back to login</Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
