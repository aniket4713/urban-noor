"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="container-x grid min-h-[80vh] items-center gap-10 py-12 lg:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] lg:block"
      >
        <Image src="/seed/collection-women.jpg" alt="" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/20 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10">
          <p className="eyebrow mb-3">Urban Noor</p>
          <p className="font-display text-4xl leading-tight">
            Jewellery that makes <span className="gold-text italic">every day</span> an occasion.
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mx-auto w-full max-w-md">
        <h1 className="font-display text-5xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-ivory/55">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </motion.div>
    </div>
  );
}
