import { Prisma, type Gender } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validators";

/** Fields needed to render a product card anywhere on the site. */
export const cardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  mrp: true,
  stock: true,
  gender: true,
  isNewArrival: true,
  isBestSeller: true,
  category: { select: { name: true, slug: true } },
  images: { select: { url: true }, orderBy: { position: "asc" }, take: 2 },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export type ProductListParams = {
  q?: string;
  gender?: string;
  category?: string; // slug (comma-separated allowed)
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  pageSize?: number;
};

export function parseListParams(sp: URLSearchParams | Record<string, string | string[] | undefined>): ProductListParams {
  const get = (k: string) => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const num = (k: string) => {
    const v = Number(get(k));
    return Number.isFinite(v) && v > 0 ? v : undefined;
  };
  const sort = get("sort");
  return {
    q: get("q")?.slice(0, 80),
    gender: get("gender")?.toUpperCase(),
    category: get("category"),
    minPrice: num("minPrice"),
    maxPrice: num("maxPrice"),
    inStock: get("inStock") === "1" || get("inStock") === "true",
    sort: (["newest", "price_asc", "price_desc", "popular"] as const).find((s) => s === sort) ?? "newest",
    page: num("page") ?? 1,
    pageSize: Math.min(num("pageSize") ?? 12, 48),
  };
}

function buildWhere(p: ProductListParams, includeInactive = false): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = includeInactive ? {} : { isActive: true };
  if (p.q) {
    where.OR = [
      { name: { contains: p.q, mode: "insensitive" } },
      { description: { contains: p.q, mode: "insensitive" } },
      { tags: { has: p.q.toLowerCase() } },
      { category: { name: { contains: p.q, mode: "insensitive" } } },
    ];
  }
  if (p.gender && ["MEN", "WOMEN", "UNISEX"].includes(p.gender)) {
    // Unisex pieces show up in both Men and Women collections
    where.gender = p.gender === "UNISEX" ? "UNISEX" : { in: [p.gender as Gender, "UNISEX"] };
  }
  if (p.category) where.category = { slug: { in: p.category.split(",").filter(Boolean) } };
  if (p.minPrice || p.maxPrice) where.price = { gte: p.minPrice, lte: p.maxPrice };
  if (p.inStock) where.stock = { gt: 0 };
  return where;
}

const orderBy = (sort: ProductListParams["sort"]): Prisma.ProductOrderByWithRelationInput[] => {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }];
    case "price_desc":
      return [{ price: "desc" }];
    case "popular":
      return [{ soldCount: "desc" }, { createdAt: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
};

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = slugify(base) || "product";
  let i = 1;
  while (await prisma.product.findFirst({ where: { slug, NOT: excludeId ? { id: excludeId } : undefined } })) {
    slug = `${slugify(base)}-${++i}`;
  }
  return slug;
}

export const productService = {
  async list(p: ProductListParams) {
    const where = buildWhere(p);
    const page = p.page ?? 1;
    const pageSize = p.pageSize ?? 12;
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: cardSelect,
        orderBy: orderBy(p.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  },

  async suggestions(q: string) {
    if (!q || q.length < 2) return [];
    return prisma.product.findMany({
      where: buildWhere({ q }),
      select: { id: true, name: true, slug: true, price: true, images: { select: { url: true }, take: 1, orderBy: { position: "asc" } } },
      take: 6,
    });
  },

  async getBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, isActive: true },
      include: { category: true, images: { orderBy: { position: "asc" } } },
    });
  },

  async related(productId: string, categoryId: string, gender: Gender) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        OR: [{ categoryId }, { gender }],
      },
      select: cardSelect,
      orderBy: { soldCount: "desc" },
      take: 4,
    });
  },

  async home() {
    const [newArrivals, bestSellers, featured] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true, isNewArrival: true }, select: cardSelect, orderBy: { createdAt: "desc" }, take: 10 }),
      prisma.product.findMany({ where: { isActive: true, isBestSeller: true }, select: cardSelect, orderBy: { soldCount: "desc" }, take: 8 }),
      prisma.product.findMany({ where: { isActive: true, isFeatured: true }, select: cardSelect, take: 8 }),
    ]);
    return { newArrivals, bestSellers, featured };
  },

  /** Price/stock lookup used by checkout — the ONLY source of truth for prices. */
  async findForCheckout(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, slug: true, price: true, stock: true, isActive: true, images: { select: { url: true }, take: 1, orderBy: { position: "asc" } } },
    });
  },

  async allSlugs() {
    return prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  },

  // ----------------------------- ADMIN -----------------------------

  async adminList(params: ProductListParams & { status?: string }) {
    const where = buildWhere(params, true);
    if (params.status === "active") where.isActive = true;
    if (params.status === "inactive") where.isActive = false;
    if (params.status === "lowstock") where.stock = { lte: 5 };
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true } }, images: { take: 1, orderBy: { position: "asc" } } },
        orderBy: orderBy(params.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);
    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  },

  async adminGet(id: string) {
    const p = await prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } }, category: true } });
    if (!p) throw new ApiError(404, "Product not found");
    return p;
  },

  async create(input: z.infer<typeof productSchema>) {
    const { images, slug, sku, material, ...rest } = input;
    if (rest.mrp < rest.price) throw new ApiError(422, "MRP should be greater than or equal to the selling price");
    return prisma.product.create({
      data: {
        ...rest,
        slug: await uniqueSlug(slug || rest.name),
        sku: sku || null,
        material: material || null,
        tags: rest.tags.map((t) => t.toLowerCase()),
        images: { create: images.map((url, position) => ({ url, position })) },
      },
      include: { category: true },
    });
  },

  async update(id: string, input: z.infer<typeof productSchema>) {
    const { images, slug, sku, material, ...rest } = input;
    if (rest.mrp < rest.price) throw new ApiError(422, "MRP should be greater than or equal to the selling price");
    const before = await prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!before) throw new ApiError(404, "Product not found");
    const updated = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          ...rest,
          slug: await uniqueSlug(slug || rest.name, id),
          sku: sku || null,
          material: material || null,
          tags: rest.tags.map((t) => t.toLowerCase()),
          images: { create: images.map((url, position) => ({ url, position })) },
        },
        include: { category: true },
      });
    });
    return { before, updated };
  },

  async remove(id: string) {
    return prisma.product.delete({ where: { id }, include: { category: true } });
  },

  async duplicate(id: string) {
    const src = await this.adminGet(id);
    return prisma.product.create({
      data: {
        name: `${src.name} (Copy)`,
        slug: await uniqueSlug(`${src.name} copy`),
        description: src.description,
        gender: src.gender,
        categoryId: src.categoryId,
        price: src.price,
        mrp: src.mrp,
        stock: src.stock,
        material: src.material,
        tags: src.tags,
        isActive: false, // drafts start hidden
        images: { create: src.images.map((i) => ({ url: i.url, position: i.position })) },
      },
    });
  },
};
