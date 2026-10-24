import { prisma } from "@/lib/prisma";
import type { Setting } from "@prisma/client";

export type StoreSettings = Omit<Setting, "id" | "updatedAt">;

// Settings rarely change, so keep them in memory for 60s instead of querying on every request.
let cache: { value: Setting; at: number } | null = null;
const TTL_MS = 60_000;

export const settingsService = {
  /** Always returns a settings row (creates defaults the first time). Cached for 60s. */
  async get(): Promise<Setting> {
    if (cache && Date.now() - cache.at < TTL_MS) return cache.value;
    const value =
      (await prisma.setting.findUnique({ where: { id: "store" } })) ??
      (await prisma.setting.create({ data: { id: "store" } }));
    cache = { value, at: Date.now() };
    return value;
  },

  /** Same as get(), but falls back to defaults if the DB is unreachable (keeps the layout rendering). */
  async getSafe(): Promise<Setting> {
    try {
      return await this.get();
    } catch (err) {
      console.error("[settings] using defaults —", (err as Error).message);
      return {
        id: "store",
        tagline: "Shine Without Limits",
        announcement: "Free shipping on orders above ₹999 ✦ Anti-tarnish & skin-friendly ✦ Easy 7-day returns",
        heroTitle: "Shine Without Limits",
        heroSubtitle: "Statement jewellery for him and her — crafted to turn every moment into an occasion.",
        heroImage: "/seed/hero.jpg",
        shippingFee: 79,
        freeShippingThreshold: 999,
        whatsappNumber: "919999999999",
        contactEmail: "hello@urbannoor.in",
        contactPhone: "+91 99999 99999",
        address: "Jaipur, Rajasthan, India",
        instagramUrl: "https://instagram.com/",
        facebookUrl: "https://facebook.com/",
        updatedAt: new Date(),
      };
    }
  },

  async update(data: Partial<StoreSettings>) {
    cache = null;
    return prisma.setting.upsert({
      where: { id: "store" },
      update: data,
      create: { id: "store", ...data },
    });
  },
};
