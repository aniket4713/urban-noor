import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import type { Setting } from "@prisma/client";
import { Logo } from "./Logo";

const cols = [
  {
    title: "Shop",
    links: [
      ["Women", "/shop?gender=WOMEN"],
      ["Men", "/shop?gender=MEN"],
      ["New Arrivals", "/shop?sort=newest"],
      ["Best Sellers", "/shop?sort=popular"],
      ["Jewellery Sets", "/category/jewellery-sets"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Track Order", "/track-order"],
      ["Shipping Policy", "/policies/shipping"],
      ["Returns & Refunds", "/policies/returns"],
      ["Contact Us", "/contact"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Urban Noor", "/about"],
      ["Privacy Policy", "/policies/privacy"],
      ["Terms & Conditions", "/policies/terms"],
    ],
  },
];

export function Footer({ settings }: { settings: Setting }) {
  return (
    <footer className="relative mt-10 border-t border-ivory/5 bg-brand-soft">
      <div className="divider-gold" />
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo className="items-start" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/55">
            {settings.tagline}. Statement artificial jewellery for him and her — anti-tarnish, skin-friendly and made to be worn every day.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ivory/60">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" />{settings.contactEmail}</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" />{settings.contactPhone}</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" />{settings.address}</li>
          </ul>
          <div className="mt-6 flex gap-3">
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/10 transition hover:border-magenta hover:text-magenta">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/10 transition hover:border-magenta hover:text-magenta">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold">{c.title}</h4>
            <ul className="space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-ivory/60 transition hover:pl-1 hover:text-magenta">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ivory/5">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-ivory/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Urban Noor. All rights reserved.</p>
          <p className="flex items-center gap-2">Secure payments by Razorpay · UPI · Cards · Netbanking</p>
        </div>
      </div>
    </footer>
  );
}
