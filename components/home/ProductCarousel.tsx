"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading, Stagger } from "@/components/motion/Reveal";
import { ProductCard, type CardProduct } from "@/components/store/ProductCard";

export function ProductCarousel({ eyebrow, title, products, viewAll }: { eyebrow: string; title: string; products: CardProduct[]; viewAll: string }) {
  const track = useRef<HTMLDivElement>(null);
  if (!products.length) return null;

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="py-20">
      <div className="container-x">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading eyebrow={eyebrow} title={title} align="left" />
          <div className="mb-10 hidden gap-2 sm:flex">
            <button onClick={() => scroll(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/15 transition hover:border-magenta hover:text-magenta" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => scroll(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ivory/15 transition hover:border-magenta hover:text-magenta" aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div ref={track} className="container-x snap-x snap-mandatory overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Stagger className="flex gap-5">
          {products.map((p) => (
            <div key={p.id} className="w-[64%] flex-shrink-0 snap-start sm:w-[38%] md:w-[30%] lg:w-[23%]">
              <ProductCard product={p} />
            </div>
          ))}
        </Stagger>
      </div>
      <div className="container-x mt-4 text-center">
        <Link href={viewAll} className="btn-outline">
          View all
        </Link>
      </div>
    </section>
  );
}
