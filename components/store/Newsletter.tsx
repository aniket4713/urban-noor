"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/fetcher";
import { useToast } from "@/components/providers/ToastProvider";

export function Newsletter() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api<{ message: string }>("/api/newsletter", { body: { email } });
      toast(r.message);
      setDone(true);
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-brand-soft" />
      <div className="container-x relative text-center">
        <p className="eyebrow mb-3">The Noor Circle</p>
        <h2 className="font-display text-4xl sm:text-5xl">
          Get <span className="gold-text italic">10% off</span> your first order
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-ivory/55">New drops, styling notes and members-only offers. No spam — only sparkle.</p>
        {done ? (
          <motion.p initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-8 text-lg text-gold">
            ✦ Welcome to the circle! Use code <b>NOOR10</b> at checkout.
          </motion.p>
        ) : (
          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="input flex-1 rounded-full" aria-label="Email" />
            <button className="btn-gold" disabled={loading}>
              {loading ? "Joining…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
