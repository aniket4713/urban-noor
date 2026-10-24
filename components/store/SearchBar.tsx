"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search, X } from "lucide-react";
import { formatINR } from "@/lib/utils";

type Suggestion = { id: string; name: string; slug: string; price: number; images: { url: string }[] };

export function SearchBar({ onNavigate, autoFocus }: { onNavigate?: () => void; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // debounced live suggestions
  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setFocused(false);
    onNavigate?.();
    router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const showPanel = focused && q.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          autoFocus={autoFocus}
          placeholder="Search jhumkas, chains, rings…"
          className="w-full rounded-full border border-ivory/10 bg-noir-800/80 py-2.5 pl-11 pr-10 text-sm text-ivory placeholder:text-ivory/35 outline-none transition focus:border-gold/60"
          aria-label="Search products"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/40 hover:text-magenta" aria-label="Clear search">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </button>
        )}
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-ivory/10 bg-noir-800/95 shadow-card backdrop-blur"
          >
            {results.length === 0 && !loading && <p className="px-4 py-5 text-sm text-ivory/50">No matches for “{q}”</p>}
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/product/${r.slug}`}
                onClick={() => {
                  setFocused(false);
                  onNavigate?.();
                }}
                className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-ivory/5"
              >
                <img src={r.images[0]?.url || "/seed/hero.jpg"} alt="" className="h-11 w-11 rounded-lg object-cover" />
                <span className="flex-1 text-sm">{r.name}</span>
                <span className="text-sm text-gold">{formatINR(r.price)}</span>
              </Link>
            ))}
            {results.length > 0 && (
              <button onClick={submit} className="w-full border-t border-ivory/10 px-4 py-3 text-left text-xs uppercase tracking-widest text-gold hover:bg-ivory/5">
                See all results →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
