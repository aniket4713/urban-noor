"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(194,24,107,0.12),transparent_60%)]" />
      {/* a "lost earring" spinning gently */}
      <motion.svg viewBox="0 0 120 200" className="relative h-40 w-24" animate={{ rotate: [-12, 12, -12] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ originY: 0 }}>
        <defs>
          <linearGradient id="g404" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F6E3A8" />
            <stop offset=".5" stopColor="#C2186B" />
            <stop offset="1" stopColor="#8E6B24" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="16" r="12" fill="none" stroke="url(#g404)" strokeWidth="5" />
        <line x1="60" y1="28" x2="60" y2="80" stroke="url(#g404)" strokeWidth="3" />
        <path d="M60 80 C100 110 90 170 60 190 C30 170 20 110 60 80Z" fill="url(#g404)" />
      </motion.svg>
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gold-text relative mt-6 font-display text-8xl font-semibold">
        404
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="relative mt-2 font-display text-3xl">
        Looks like this piece went missing
      </motion.p>
      <p className="relative mt-3 max-w-md text-ivory/55">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to the sparkle.</p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative mt-8 flex gap-3">
        <Link href="/" className="btn-gold">Back home</Link>
        <Link href="/shop" className="btn-outline">Shop all</Link>
      </motion.div>
    </div>
  );
}
