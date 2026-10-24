"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/** Fade-up when the element scrolls into view. */
export function Reveal({ children, delay = 0, className, y = 30 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/** Children wrapped in <motion.div variants={staggerItem}> appear one after another. */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }}>
      {children}
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center" }: { eyebrow?: string; title: string; subtitle?: string; align?: "center" | "left" }) {
  return (
    <Reveal className={align === "center" ? "mx-auto mb-12 max-w-2xl text-center" : "mb-10"}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-display text-4xl leading-tight sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-3 text-sm text-ivory/55 sm:text-base">{subtitle}</p>}
      <div className={align === "center" ? "mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" : "mt-5 h-px w-24 bg-gradient-to-r from-gold to-transparent"} />
    </Reveal>
  );
}
