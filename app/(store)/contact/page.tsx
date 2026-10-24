import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { settingsService } from "@/lib/services/settingsService";

export const metadata: Metadata = { title: "Contact Us", description: "Get in touch with Urban Noor for orders, returns and styling help." };
export const revalidate = 300;

export default async function ContactPage() {
  const s = await settingsService.getSafe();
  const cards = [
    { icon: MessageCircle, title: "WhatsApp", value: "Chat with us", href: `https://wa.me/${s.whatsappNumber}` },
    { icon: Mail, title: "Email", value: s.contactEmail, href: `mailto:${s.contactEmail}` },
    { icon: Phone, title: "Phone", value: s.contactPhone, href: `tel:${s.contactPhone.replace(/\s/g, "")}` },
    { icon: MapPin, title: "Studio", value: s.address },
  ];
  return (
    <div className="container-x py-16">
      <Reveal className="mx-auto mb-14 max-w-xl text-center">
        <p className="eyebrow mb-3">We&apos;re here to help</p>
        <h1 className="font-display text-5xl sm:text-6xl">Contact us</h1>
        <p className="mt-3 text-ivory/55">Questions about an order, sizing or a gift? We usually reply within a few hours (Mon–Sat, 10am–7pm).</p>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.1}>
            <a href={c.href} target={c.href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="card group block h-full p-8 text-center transition hover:-translate-y-1 hover:border-gold/40">
              <c.icon className="mx-auto h-8 w-8 text-gold transition group-hover:scale-110" strokeWidth={1.4} />
              <h2 className="mt-4 font-display text-2xl">{c.title}</h2>
              <p className="mt-1 break-words text-sm text-ivory/60">{c.value}</p>
            </a>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
