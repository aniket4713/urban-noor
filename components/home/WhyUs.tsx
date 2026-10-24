"use client";

import { motion } from "framer-motion";
import { Gem, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { SectionHeading, Stagger, staggerItem } from "@/components/motion/Reveal";

const features = [
  { icon: Gem, title: "Anti-tarnish finish", text: "Premium plating that keeps its glow — wear it daily, worry-free." },
  { icon: ShieldCheck, title: "Skin-friendly", text: "Nickel- and lead-safe alloys, gentle on sensitive skin." },
  { icon: Truck, title: "Fast, free shipping", text: "Dispatched in 24 hours. Free delivery on orders above ₹999." },
  { icon: RotateCcw, title: "Easy 7-day returns", text: "Not in love? Return it within 7 days, no awkward questions." },
];

export function WhyUs() {
  return (
    <section className="relative overflow-hidden border-y border-gold/10 bg-noir-800/50 py-24">
      <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-magenta/10 blur-3xl" />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-royal/10 blur-3xl" />
      <div className="container-x relative">
        <SectionHeading eyebrow="Why Urban Noor" title="Luxury looks, honest prices" subtitle="Every piece is hand-checked before it leaves our studio." />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <motion.div key={f.title} variants={staggerItem} whileHover={{ y: -6 }} className="card group p-8 text-center transition-colors hover:border-gold/30">
              <motion.div whileHover={{ rotate: 12, scale: 1.1 }} className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/5 text-gold transition group-hover:shadow-glow">
                <f.icon className="h-7 w-7" strokeWidth={1.4} />
              </motion.div>
              <h3 className="font-display text-2xl">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ivory/55">{f.text}</p>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
