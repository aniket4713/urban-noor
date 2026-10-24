"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero({ title, subtitle, image }: { title: string; subtitle: string; image: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const words = title.split(" ");

  return (
    <section ref={ref} className="relative flex min-h-[88vh] items-center overflow-hidden">
      {/* parallax background with slow ken-burns zoom */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <motion.div className="absolute inset-0" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-right" />
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/85 to-transparent" />
      {/* colour glows */}
      <motion.div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-magenta/20 blur-3xl" animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-royal/20 blur-3xl" animate={{ scale: [1.1, 0.9, 1.1] }} transition={{ duration: 10, repeat: Infinity }} />
      <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/30" />

      {/* floating sparkles */}
      {[...Array(14)].map((_, i) => (
        <motion.span
          key={i}
          className={`absolute h-1.5 w-1.5 rounded-full ${["bg-gold-light", "bg-magenta-light", "bg-royal-light"][i % 3]}`}
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      <motion.div style={{ opacity: fade }} className="container-x relative z-10 py-24">
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="eyebrow mb-6 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" /> New Festive Collection
        </motion.p>

        <h1 className="max-w-3xl font-display text-6xl font-medium leading-[0.95] sm:text-7xl lg:text-8xl">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-2 pr-4 align-bottom">
              <motion.span
                className={i === words.length - 1 ? "gold-text inline-block italic" : "inline-block"}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="mt-6 max-w-lg text-base leading-relaxed text-ivory/70 sm:text-lg">
          {subtitle}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="mt-10 flex flex-wrap gap-4">
          <Link href="/shop?gender=WOMEN" className="btn-gold group px-8 py-4">
            Shop Women <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <Link href="/shop?gender=MEN" className="btn-outline group px-8 py-4">
            Shop Men <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-14 flex flex-wrap gap-8 text-xs uppercase tracking-[0.2em] text-ivory/50">
          <span>✦ Anti-tarnish</span>
          <span>✦ Skin-friendly</span>
          <span>✦ Ships in 24 hrs</span>
        </motion.div>
      </motion.div>

      <motion.div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 sm:block" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
        <div className="flex h-10 w-6 justify-center rounded-full border border-magenta/40 pt-2">
          <span className="h-2 w-0.5 rounded bg-brand" />
        </div>
      </motion.div>
    </section>
  );
}
