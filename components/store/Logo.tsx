import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex flex-col items-center leading-none", className)} aria-label="Urban Noor home">
      <span className="gold-text font-display text-2xl font-semibold tracking-[0.3em] sm:text-[1.7rem]">URBAN NOOR</span>
      <span className="mt-1 text-[8px] uppercase tracking-[0.55em] text-ivory/50 transition-colors group-hover:text-magenta">
        Jewellery
      </span>
    </Link>
  );
}
