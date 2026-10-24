"use client";

import { motion } from "framer-motion";
import { Check, Package, Truck, Home, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "PAID", label: "Confirmed", icon: Check },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Home },
];

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        <XCircle className="h-4 w-4" /> This order was cancelled
      </div>
    );
  }
  if (status === "PENDING") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-ivory/10 px-4 py-3 text-sm text-ivory/60">
        <Package className="h-4 w-4" /> Awaiting payment confirmation
      </div>
    );
  }
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <div className="relative flex justify-between">
      <div className="absolute left-5 right-5 top-5 h-0.5 bg-ivory/10" />
      <motion.div
        className="absolute left-5 top-5 h-0.5 bg-brand"
        initial={{ width: 0 }}
        animate={{ width: `calc(${(current / (STEPS.length - 1)) * 100}% - ${current === STEPS.length - 1 ? 40 : 20}px)` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {STEPS.map((s, i) => (
        <div key={s.key} className="relative z-10 flex flex-col items-center gap-2">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.25 }}
            className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2", i <= current ? "border-gold bg-brand text-white" : "border-ivory/15 bg-noir-800 text-ivory/40")}
          >
            <s.icon className="h-4 w-4" />
          </motion.div>
          <span className={cn("text-xs uppercase tracking-widest", i <= current ? "text-gold" : "text-ivory/40")}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
