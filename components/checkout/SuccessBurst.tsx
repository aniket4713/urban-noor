"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/** Animated check mark with a burst of gold sparkles. */
export function SuccessBurst() {
  return (
    <div className="relative mx-auto h-28 w-28">
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-gold-light"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: Math.cos(angle) * 110, y: Math.sin(angle) * 110, opacity: 0, scale: 1.4 }}
            transition={{ duration: 1.2, delay: 0.35, ease: "easeOut" }}
          />
        );
      })}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-gold-light via-magenta to-royal shadow-glow"
      >
        <motion.div initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Check className="h-14 w-14 text-white" strokeWidth={2.5} />
        </motion.div>
      </motion.div>
    </div>
  );
}
