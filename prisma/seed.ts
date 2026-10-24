/**
 * Seed script — run with `npm run db:seed`
 * Creates: default admin, store settings, categories, 16 sample products and 2 coupons.
 * Safe to run more than once (uses upsert).
 */
import { PrismaClient, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Necklaces", slug: "necklaces", sortOrder: 1 },
  { name: "Earrings", slug: "earrings", sortOrder: 2 },
  { name: "Rings", slug: "rings", sortOrder: 3 },
  { name: "Bracelets", slug: "bracelets", sortOrder: 4 },
  { name: "Bangles", slug: "bangles", sortOrder: 5 },
  { name: "Chains", slug: "chains", sortOrder: 6 },
  { name: "Pendants", slug: "pendants", sortOrder: 7 },
  { name: "Anklets", slug: "anklets", sortOrder: 8 },
  { name: "Kadas", slug: "kadas", sortOrder: 9 },
  { name: "Jewellery Sets", slug: "jewellery-sets", sortOrder: 10 },
];

type SeedProduct = {
  name: string;
  slug: string;
  category: string;
  gender: Gender;
  price: number;
  mrp: number;
  stock: number;
  material: string;
  description: string;
  tags: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  soldCount?: number;
};

const products: SeedProduct[] = [
  {
    name: "Aurora Kundan Necklace Set", slug: "aurora-kundan-necklace-set", category: "jewellery-sets", gender: "WOMEN",
    price: 1499, mrp: 2999, stock: 25, material: "Gold-plated brass, Kundan stones",
    description: "A regal kundan choker with matching studs and ring. Hand-finished ruby-toned stones set in a warm gold plating — made for weddings, festivals and every moment you want to own the room.",
    tags: ["wedding", "kundan", "festive"], isFeatured: true, isBestSeller: true, soldCount: 140,
  },
  {
    name: "Noor Pearl Drop Earrings", slug: "noor-pearl-drop-earrings", category: "earrings", gender: "WOMEN",
    price: 599, mrp: 1199, stock: 40, material: "Gold-plated alloy, faux pearls",
    description: "Luminous teardrop pearls on a delicate gold hook. Lightweight enough for all-day wear, elegant enough for the evening.",
    tags: ["pearl", "everyday", "gift"], isNewArrival: true, isBestSeller: true, soldCount: 96,
  },
  {
    name: "Celeste CZ Solitaire Ring", slug: "celeste-cz-solitaire-ring", category: "rings", gender: "WOMEN",
    price: 449, mrp: 899, stock: 50, material: "Rhodium-plated brass, cubic zirconia",
    description: "A brilliant-cut cubic zirconia solitaire that sparkles like the real thing. Adjustable band fits most sizes.",
    tags: ["cz", "minimal", "gift"], isNewArrival: true, soldCount: 61,
  },
  {
    name: "Meher Gold-Plated Bangles (Set of 4)", slug: "meher-gold-plated-bangles", category: "bangles", gender: "WOMEN",
    price: 899, mrp: 1599, stock: 30, material: "Gold-plated brass, enamel",
    description: "Four stackable bangles with ruby-red enamel accents and a high-shine finish. Available in size 2.4 and 2.6.",
    tags: ["bangles", "festive", "set"], isFeatured: true, soldCount: 72,
  },
  {
    name: "Zoya Layered Chain Necklace", slug: "zoya-layered-chain-necklace", category: "necklaces", gender: "WOMEN",
    price: 749, mrp: 1499, stock: 35, material: "18K gold-plated stainless steel",
    description: "Three delicate layers in one clasp — no tangling, no fuss. Anti-tarnish and water resistant for everyday shine.",
    tags: ["layered", "anti-tarnish", "everyday"], isNewArrival: true, isBestSeller: true, soldCount: 118,
  },
  {
    name: "Ruhani Temple Jhumkas", slug: "ruhani-temple-jhumkas", category: "earrings", gender: "WOMEN",
    price: 699, mrp: 1399, stock: 28, material: "Antique gold-plated alloy, green stones",
    description: "Traditional temple-style jhumkas with emerald-green drops and tiny pearl fringes. A festive classic reimagined.",
    tags: ["jhumka", "temple", "festive"], isFeatured: true, soldCount: 84,
  },
  {
    name: "Isha Charm Bracelet", slug: "isha-charm-bracelet", category: "bracelets", gender: "WOMEN",
    price: 549, mrp: 999, stock: 45, material: "Gold-plated stainless steel, pink stones",
    description: "A dainty chain bracelet scattered with blush-pink charms. Adjustable length with an extender.",
    tags: ["charm", "minimal", "gift"], isNewArrival: true, soldCount: 39,
  },
  {
    name: "Payal Ghungroo Anklets (Pair)", slug: "payal-ghungroo-anklets", category: "anklets", gender: "WOMEN",
    price: 399, mrp: 799, stock: 60, material: "Silver-plated alloy",
    description: "A pair of silver-toned anklets with tiny ghungroo bells that chime softly with every step.",
    tags: ["anklet", "ethnic"], soldCount: 55,
  },
  {
    name: "Sitara Emerald Pendant", slug: "sitara-emerald-pendant", category: "pendants", gender: "WOMEN",
    price: 649, mrp: 1299, stock: 33, material: "Gold-plated brass, green CZ",
    description: "A round emerald-green stone framed in a polished gold bezel, on an 18-inch fine chain.",
    tags: ["pendant", "emerald", "gift"], isFeatured: true, soldCount: 47,
  },
  {
    name: "Titan Cuban Link Chain", slug: "titan-cuban-link-chain", category: "chains", gender: "MEN",
    price: 999, mrp: 1999, stock: 40, material: "18K gold-plated stainless steel",
    description: "A bold 8mm Cuban link with a secure box clasp. Heavy feel, anti-tarnish finish and built to be worn every day.",
    tags: ["cuban", "bold", "anti-tarnish"], isFeatured: true, isBestSeller: true, soldCount: 160,
  },
  {
    name: "Raja Oxidised Kada", slug: "raja-oxidised-kada", category: "kadas", gender: "MEN",
    price: 799, mrp: 1499, stock: 30, material: "Oxidised brass",
    description: "A heavy, hand-engraved kada with an antique oxidised finish. Rugged, traditional and unmistakably royal.",
    tags: ["kada", "ethnic", "oxidised"], isBestSeller: true, soldCount: 88,
  },
  {
    name: "Onyx Signet Ring", slug: "onyx-signet-ring", category: "rings", gender: "MEN",
    price: 599, mrp: 1199, stock: 38, material: "Gold-plated stainless steel, black onyx",
    description: "A classic signet ring with a polished black onyx face. Understated power for everyday wear.",
    tags: ["signet", "onyx", "classic"], isNewArrival: true, soldCount: 52,
  },
  {
    name: "Nomad Steel Bracelet", slug: "nomad-steel-bracelet", category: "bracelets", gender: "MEN",
    price: 649, mrp: 1199, stock: 42, material: "Stainless steel, black stones",
    description: "A matte-black beaded bracelet with polished steel spacers. Stretch-fit and sweat-proof.",
    tags: ["beaded", "steel", "everyday"], isNewArrival: true, soldCount: 44,
  },
  {
    name: "Rudra Rudraksha Pendant", slug: "rudra-rudraksha-pendant", category: "pendants", gender: "UNISEX",
    price: 549, mrp: 999, stock: 36, material: "Gold-plated brass, rudraksha bead",
    description: "A natural rudraksha bead capped in gold, on a 22-inch rope chain. Spiritual, minimal and modern.",
    tags: ["rudraksha", "spiritual"], soldCount: 63,
  },
  {
    name: "Blade Stud Earrings", slug: "blade-stud-earrings", category: "earrings", gender: "MEN",
    price: 399, mrp: 799, stock: 55, material: "Black-plated stainless steel",
    description: "Sharp, geometric studs in a gunmetal finish. Hypoallergenic posts, sold as a pair.",
    tags: ["studs", "minimal", "men"], soldCount: 29,
  },
  {
    name: "Sovereign Rope Chain", slug: "sovereign-rope-chain", category: "chains", gender: "MEN",
    price: 899, mrp: 1799, stock: 4, material: "18K gold-plated stainless steel",
    description: "A twisted rope chain that catches light from every angle. 24-inch length with a lobster clasp.",
    tags: ["rope", "anti-tarnish"], isNewArrival: true, isBestSeller: true, soldCount: 101,
  },
];

async function main() {
  // --- Admin ---
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@urbannoor.in").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: process.env.ADMIN_NAME || "Urban Noor Admin",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });
  console.log(`✔ Admin ready: ${adminEmail}`);

  // --- Settings ---
  await prisma.setting.upsert({ where: { id: "store" }, update: {}, create: { id: "store" } });
  console.log("✔ Store settings ready");

  // --- Categories ---
  const catMap: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, image: `/seed/cat-${c.slug}.jpg` },
    });
    catMap[c.slug] = cat.id;
  }
  console.log(`✔ ${categories.length} categories ready`);

  // --- Products ---
  for (const [i, p] of products.entries()) {
    const { category, ...data } = p;
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;
    await prisma.product.create({
      data: {
        ...data,
        sku: `UN-${String(i + 1).padStart(4, "0")}`,
        categoryId: catMap[category],
        images: {
          create: [
            { url: `/seed/${p.slug}-1.jpg`, position: 0 },
            { url: `/seed/${p.slug}-2.jpg`, position: 1 },
          ],
        },
      },
    });
  }
  console.log(`✔ ${products.length} products ready`);

  // --- Coupons ---
  await prisma.coupon.upsert({
    where: { code: "NOOR10" },
    update: {},
    create: { code: "NOOR10", type: "PERCENT", value: 10, minOrder: 499, maxDiscount: 300 },
  });
  await prisma.coupon.upsert({
    where: { code: "WELCOME100" },
    update: {},
    create: { code: "WELCOME100", type: "FLAT", value: 100, minOrder: 999 },
  });
  console.log("✔ Coupons ready: NOOR10, WELCOME100");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
