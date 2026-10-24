"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeading, Stagger, staggerItem } from "@/components/motion/Reveal";

type Cat = { id: string; name: string; slug: string; image: string | null; _count?: { products: number } };

export function CategoryTiles({ categories }: { categories: Cat[] }) {
  if (!categories.length) return null;
  return (
    <section className="container-x py-20">
      <SectionHeading eyebrow="Shop by Category" title="Find your signature piece" />
      <Stagger className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => (
          <motion.div key={c.id} variants={staggerItem}>
            <Link href={`/category/${c.slug}`} className="group block text-center">
              <motion.div whileHover={{ rotate: -2, scale: 1.03 }} className="relative mx-auto aspect-square overflow-hidden rounded-full border border-gold/20 p-1.5 transition-colors duration-500 group-hover:border-magenta">
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  <Image src={c.image || "/seed/hero.jpg"} alt={c.name} fill sizes="(max-width:640px) 45vw, 20vw" className="object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-noir/20 transition group-hover:bg-transparent" />
                </div>
              </motion.div>
              <h3 className="mt-4 font-display text-xl transition group-hover:text-magenta">{c.name}</h3>
              {c._count && <p className="text-[11px] uppercase tracking-widest text-ivory/40">{c._count.products} pieces</p>}
            </Link>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}
