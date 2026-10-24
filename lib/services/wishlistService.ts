import { prisma } from "@/lib/prisma";
import { cardSelect } from "./productService";

export const wishlistService = {
  async list(userId: string) {
    const rows = await prisma.wishlistItem.findMany({
      where: { userId, product: { isActive: true } },
      orderBy: { createdAt: "desc" },
      select: { product: { select: cardSelect } },
    });
    return rows.map((r) => r.product);
  },

  async ids(userId: string) {
    const rows = await prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true } });
    return rows.map((r) => r.productId);
  },

  /** Adds if missing, removes if present. Returns the new state. */
  async toggle(userId: string, productId: string) {
    const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { inWishlist: false };
    }
    await prisma.wishlistItem.create({ data: { userId, productId } });
    return { inWishlist: true };
  },
};
