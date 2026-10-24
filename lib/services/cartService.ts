import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CartLine = {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    mrp: number;
    stock: number;
    image: string | null;
  } | null; // null = product no longer available
};

const productFields = {
  id: true,
  name: true,
  slug: true,
  price: true,
  mrp: true,
  stock: true,
  isActive: true,
  images: { select: { url: true }, take: 1, orderBy: { position: "asc" } },
} satisfies Prisma.ProductSelect;

export const cartService = {
  /** Attach fresh product data (price, stock) to a list of { productId, quantity }. */
  async hydrate(items: { productId: string; quantity: number }[]): Promise<CartLine[]> {
    const ids = Array.from(new Set(items.map((i) => i.productId)));
    const products = await prisma.product.findMany({ where: { id: { in: ids } }, select: productFields });
    const map = new Map(products.map((p) => [p.id, p]));
    return items.map((i) => {
      const p = map.get(i.productId);
      return {
        productId: i.productId,
        quantity: i.quantity,
        product:
          p && p.isActive
            ? { id: p.id, name: p.name, slug: p.slug, price: p.price, mrp: p.mrp, stock: p.stock, image: p.images[0]?.url ?? null }
            : null,
      };
    });
  },

  async getForUser(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { select: { productId: true, quantity: true } } },
    });
    return this.hydrate(cart?.items ?? []);
  },

  /** Replace the saved cart with the given lines (client sends the merged cart). */
  async replace(userId: string, items: { productId: string; quantity: number }[]) {
    const valid = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, isActive: true },
      select: { id: true },
    });
    const validIds = new Set(valid.map((v) => v.id));
    const clean = items.filter((i) => validIds.has(i.productId));

    const cart = await prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
      prisma.cartItem.createMany({
        data: clean.map((i) => ({ cartId: cart.id, productId: i.productId, quantity: i.quantity })),
      }),
    ]);
    return this.hydrate(clean);
  },

  async clear(userId: string) {
    await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
  },
};
