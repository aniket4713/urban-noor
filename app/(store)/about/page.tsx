import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description: "Urban Noor makes statement artificial jewellery for men and women — luxury looks at honest prices.",
};

export default function AboutPage() {
  return (
    <div className="container-x py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow mb-3">Our Story</p>
          <h1 className="font-display text-5xl leading-tight sm:text-6xl">
            Born to make <span className="gold-text italic">everyone</span> shine.
          </h1>
          <div className="mt-6 space-y-4 text-ivory/70">
            <p>
              Urban Noor — “noor” meaning light — started with a simple belief: beautiful jewellery shouldn&apos;t be saved for
              special occasions or priced out of reach. Every day is worth dressing up for.
            </p>
            <p>
              We design statement pieces for him and her — from regal kundan sets and temple jhumkas to bold Cuban chains and
              hand-engraved kadas — finished with anti-tarnish plating and skin-friendly alloys so they look as good on day
              100 as on day one.
            </p>
            <p>Every order is hand-checked, packed with care, and shipped from our studio in India.</p>
          </div>
          <Link href="/shop" className="btn-gold mt-8">Explore the collection</Link>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image src="/seed/collection-men.jpg" alt="Urban Noor jewellery" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
