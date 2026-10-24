"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Cat = { id: string; name: string; slug: string };

const PRICE_PRESETS = [
  { label: "Under ₹500", min: "", max: "500" },
  { label: "₹500 – ₹1,000", min: "500", max: "1000" },
  { label: "₹1,000 – ₹2,000", min: "1000", max: "2000" },
  { label: "Above ₹2,000", min: "2000", max: "" },
];

export const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in patch)) next.delete("page");
    start(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };
  return { sp, set, pending };
}

export function SortSelect() {
  const { sp, set, pending } = useQueryUpdater();
  return (
    <label className="flex items-center gap-2 text-sm text-ivory/60">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-gold" />}
      <span className="hidden sm:inline">Sort by</span>
      <select value={sp.get("sort") || "newest"} onChange={(e) => set({ sort: e.target.value })} className="rounded-full border border-ivory/10 bg-noir-800 px-4 py-2 text-sm text-ivory outline-none focus:border-gold">
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterPanel({ categories }: { categories: Cat[] }) {
  const { sp, set } = useQueryUpdater();
  const gender = sp.get("gender") || "";
  const selectedCats = (sp.get("category") || "").split(",").filter(Boolean);
  const [min, setMin] = useState(sp.get("minPrice") || "");
  const [max, setMax] = useState(sp.get("maxPrice") || "");

  useEffect(() => {
    setMin(sp.get("minPrice") || "");
    setMax(sp.get("maxPrice") || "");
  }, [sp]);

  const toggleCat = (slug: string) => {
    const next = selectedCats.includes(slug) ? selectedCats.filter((s) => s !== slug) : [...selectedCats, slug];
    set({ category: next.join(",") || null });
  };

  return (
    <div className="space-y-8">
      <Group title="Collection">
        <div className="flex flex-wrap gap-2">
          {[
            ["", "All"],
            ["WOMEN", "Women"],
            ["MEN", "Men"],
            ["UNISEX", "Unisex"],
          ].map(([v, l]) => (
            <Chip key={l} active={gender === v} onClick={() => set({ gender: v || null })}>
              {l}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Category">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Chip key={c.id} active={selectedCats.includes(c.slug)} onClick={() => toggleCat(c.slug)}>
              {c.name}
            </Chip>
          ))}
        </div>
      </Group>

      <Group title="Price">
        <div className="mb-3 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((p) => (
            <Chip key={p.label} active={(sp.get("minPrice") || "") === p.min && (sp.get("maxPrice") || "") === p.max} onClick={() => set({ minPrice: p.min || null, maxPrice: p.max || null })}>
              {p.label}
            </Chip>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            set({ minPrice: min || null, maxPrice: max || null });
          }}
        >
          <input value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder="Min ₹" className="input py-2" inputMode="numeric" />
          <span className="text-ivory/40">–</span>
          <input value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder="Max ₹" className="input py-2" inputMode="numeric" />
          <button className="rounded-full border border-gold/50 px-3 py-2 text-xs text-gold hover:bg-brand hover:text-white">Go</button>
        </form>
      </Group>

      <Group title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ivory/75">
          <span className={cn("relative h-6 w-11 rounded-full transition", sp.get("inStock") === "1" ? "bg-brand" : "bg-ivory/15")}>
            <motion.span layout className={cn("absolute top-1 h-4 w-4 rounded-full bg-noir", sp.get("inStock") === "1" ? "right-1" : "left-1")} />
          </span>
          <input type="checkbox" className="sr-only" checked={sp.get("inStock") === "1"} onChange={(e) => set({ inStock: e.target.checked ? "1" : null })} />
          In stock only
        </label>
      </Group>

      <button onClick={() => set({ gender: null, category: null, minPrice: null, maxPrice: null, inStock: null, q: null })} className="text-xs uppercase tracking-widest text-ivory/50 underline-offset-4 hover:text-magenta hover:underline">
        Clear all filters
      </button>
    </div>
  );
}

export function Filters({ categories }: { categories: Cat[] }) {
  const [open, setOpen] = useState(false);
  const sp = useSearchParams();
  useEffect(() => setOpen(false), [sp]);

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <div className="sticky top-28">
          <FilterPanel categories={categories} />
        </div>
      </aside>

      <button onClick={() => setOpen(true)} className="btn-outline px-4 py-2 lg:hidden">
        <SlidersHorizontal className="h-4 w-4" /> Filters
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-gold/20 bg-noir-800 p-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display text-2xl">Filters</h3>
                <button onClick={() => setOpen(false)} aria-label="Close filters">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterPanel categories={categories} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">{title}</h4>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs transition",
        active ? "border-gold bg-brand text-white" : "border-ivory/15 text-ivory/70 hover:border-gold/60 hover:text-magenta"
      )}
    >
      {children}
    </button>
  );
}

export function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const { set } = useQueryUpdater();
  if (totalPages <= 1) return null;
  return (
    <div className="mt-14 flex items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => {
            set({ page: String(p) });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={cn("h-10 w-10 rounded-full text-sm transition", p === page ? "bg-brand text-white" : "border border-ivory/10 hover:border-magenta hover:text-magenta")}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
