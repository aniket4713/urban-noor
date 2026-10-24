"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { api } from "@/lib/fetcher";
import { cn } from "@/lib/utils";

/** Fetch JSON on mount (and whenever `url` changes); exposes reload(). */
export function useAdminData<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    try {
      setData(await api<T>(url));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [url]);
  useEffect(() => {
    reload();
  }, [reload]);
  return { data, error, loading, reload, setData };
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ivory/50">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-ivory/10 text-ivory/60",
  PAID: "bg-sky-500/15 text-sky-700",
  SHIPPED: "bg-amber-500/15 text-amber-700",
  DELIVERED: "bg-emerald-500/15 text-emerald-700",
  CANCELLED: "bg-red-500/15 text-red-600",
  CAPTURED: "bg-emerald-500/15 text-emerald-700",
  CREATED: "bg-ivory/10 text-ivory/60",
  FAILED: "bg-red-500/15 text-red-600",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider", STATUS_STYLES[status] ?? "bg-ivory/10")}>{status}</span>;
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-ivory/10 bg-noir-800 p-6"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-2xl">{title}</h2>
              <button onClick={onClose} aria-label="Close"><X className="h-5 w-5 text-ivory/60" /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Field({ label, children, hint, className }: { label: string; children: React.ReactNode; hint?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-ivory/55">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-ivory/35">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-ivory/75">
      <button type="button" onClick={() => onChange(!checked)} className={cn("relative h-6 w-11 flex-shrink-0 rounded-full transition", checked ? "bg-brand" : "bg-ivory/15")} aria-pressed={checked}>
        <motion.span layout className={cn("absolute top-1 h-4 w-4 rounded-full bg-noir", checked ? "right-1" : "left-1")} />
      </button>
      {label}
    </label>
  );
}

export function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-end gap-2 text-sm">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border border-ivory/10 px-3 py-1.5 disabled:opacity-30">Prev</button>
      <span className="text-ivory/50">Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="rounded-lg border border-ivory/10 px-3 py-1.5 disabled:opacity-30">Next</button>
    </div>
  );
}

export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ivory/5 bg-noir-800">
      <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
    </div>
  );
}

export const th = "px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-ivory/45";
export const td = "px-4 py-3 align-middle";
