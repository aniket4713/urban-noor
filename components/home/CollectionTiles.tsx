"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const tiles = [
  { title: "For Her", sub: "Kundan · Jhumkas · Pearls · Bangles", href: "/shop?gender=WOMEN", img: "/seed/collection-women.jpg" },
  { title: "For Him", sub: "Chains · Kadas · Rings · Bracelets", href: "/shop?gender=MEN", img: "/seed/collection-men.jpeg" },
];

export function CollectionTiles() {
  return (
    <section className="container-x py-20">
      <div className="grid gap-6 md:grid-cols-2">
        {tiles.map((t, i) => (
          <Reveal key={t.title} delay={i * 0.15}>
            <Link href={t.href} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[5/4]">
              <motion.div className="absolute inset-0" whileHover={{ scale: 1.08 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
                <Image src={t.img} alt={t.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-royal-dark/85 via-magenta/25 to-transparent" />
              <div className="absolute inset-0 rounded-3xl border border-gold/0 transition-all duration-700 group-hover:inset-4 group-hover:border-white/60" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-light">The Collection</p>
                <h3 className="font-display text-5xl text-white sm:text-6xl">{t.title}</h3>
                <p className="mt-2 max-h-0 overflow-hidden text-sm text-white/85 opacity-0 transition-all duration-500 group-hover:max-h-10 group-hover:opacity-100">{t.sub}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold-light">
                  Explore <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-1 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
