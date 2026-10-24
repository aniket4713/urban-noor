"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

/** Product image gallery: thumbnails, swipe on mobile, hover-zoom that follows the cursor. */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const list = images.length ? images : ["/seed/hero.jpg"];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [dir, setDir] = useState(1);

  const go = (i: number) => {
    setDir(i > index ? 1 : -1);
    setIndex((i + list.length) % list.length);
  };

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex gap-3 md:flex-col">
        {list.map((src, i) => (
          <button
            key={src + i}
            onClick={() => go(i)}
            className={cn("relative h-20 w-16 overflow-hidden rounded-xl border-2 transition md:h-24 md:w-20", i === index ? "border-gold" : "border-transparent opacity-60 hover:opacity-100")}
            aria-label={`Show image ${i + 1}`}
          >
            <Image src={src} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        id="product-main-image"
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-noir-700"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            className="absolute inset-0"
            initial={{ opacity: 0, x: dir * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(index + 1);
              else if (info.offset.x > 60) go(index - 1);
            }}
          >
            <Image
              src={list[index]}
              alt={name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-300"
              style={{ transform: zoom ? "scale(1.8)" : "scale(1)", transformOrigin: origin }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <span className="pointer-events-none absolute right-4 top-4 flex items-center gap-1 rounded-full bg-noir/60 px-3 py-1 text-[10px] uppercase tracking-widest text-ivory/70 backdrop-blur">
          <ZoomIn className="h-3 w-3" /> Hover to zoom
        </span>

        {list.length > 1 && (
          <>
            <button onClick={() => go(index - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-noir/60 p-2 backdrop-blur hover:bg-noir" aria-label="Previous image">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(index + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-noir/60 p-2 backdrop-blur hover:bg-noir" aria-label="Next image">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {list.map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-brand" : "w-1.5 bg-ivory/40")} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
