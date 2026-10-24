"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { SectionHeading, Stagger, staggerItem } from "@/components/motion/Reveal";

export function InstaGrid({ url }: { url: string }) {
  return (
    <section className="container-x py-20">
      <SectionHeading eyebrow="@urbannoor" title="Styled by you" subtitle="Tag us to be featured on our wall of shine." />
      <Stagger className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <motion.a key={n} variants={staggerItem} href={url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden rounded-xl" aria-label="View on Instagram">
            <Image src={`/seed/insta-${n}.jpg`} alt="" fill sizes="(max-width:1024px) 33vw, 16vw" className="object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 flex items-center justify-center bg-brand/70 opacity-0 transition group-hover:opacity-100">
              <Instagram className="h-6 w-6 text-white" />
            </div>
          </motion.a>
        ))}
      </Stagger>
    </section>
  );
}
