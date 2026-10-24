"use client";

import { motion } from "framer-motion";

export function WhatsAppButton({ number }: { number: string }) {
  if (!number) return null;
  const href = `https://wa.me/${number}?text=${encodeURIComponent("Hi Urban Noor! I have a question about your jewellery.")}`;
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-5px_rgba(37,211,102,.6)]"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
      <svg viewBox="0 0 32 32" className="relative h-7 w-7 fill-current" aria-hidden>
        <path d="M16.004 3C9.38 3 4 8.38 4 15.004c0 2.117.553 4.183 1.604 6.005L4 28l7.17-1.582a11.94 11.94 0 0 0 4.834 1.013h.004C22.626 27.431 28 22.05 28 15.43 28 8.81 22.626 3 16.004 3Zm0 21.98h-.003a9.92 9.92 0 0 1-5.06-1.388l-.363-.215-4.255.94.906-4.15-.236-.38a9.94 9.94 0 0 1-1.523-5.284c0-5.49 4.47-9.96 9.97-9.96 5.493 0 9.957 4.47 9.957 9.96 0 5.49-4.47 10.477-9.393 10.477Zm5.46-7.45c-.3-.15-1.77-.874-2.044-.973-.274-.1-.474-.15-.674.15-.2.3-.774.973-.95 1.173-.174.2-.35.225-.65.075-.3-.15-1.266-.467-2.41-1.487-.89-.794-1.492-1.775-1.667-2.075-.175-.3-.019-.462.131-.611.135-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.674-1.625-.924-2.225-.243-.585-.49-.506-.674-.515l-.575-.01c-.2 0-.525.075-.8.375-.274.3-1.05 1.026-1.05 2.5s1.075 2.9 1.225 3.1c.15.2 2.116 3.231 5.126 4.531.716.309 1.275.494 1.71.632.719.229 1.373.196 1.89.119.577-.086 1.77-.724 2.02-1.423.25-.7.25-1.3.175-1.424-.075-.125-.275-.2-.575-.35Z" />
      </svg>
    </motion.a>
  );
}
