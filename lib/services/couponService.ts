import { z } from "zod";
import type { Coupon } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { couponSchema } from "@/lib/validators";

/** Returns the discount (₹) a coupon gives on a subtotal, or throws a friendly error. */
export function computeDiscount(coupon: Coupon, subtotal: number) {
  if (!coupon.isActive) throw new ApiError(400, "This coupon is no longer active");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new ApiError(400, "This coupon has expired");
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "This coupon has reached its usage limit");
  }
  if (subtotal < coupon.minOrder) {
    throw new ApiError(400, `Add items worth ${formatINR(coupon.minOrder - subtotal)} more to use this coupon`);
  }
  let discount = coupon.type === "PERCENT" ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  return Math.min(discount, subtotal);
}

export const couponService = {
  async findValid(code: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (!coupon) throw new ApiError(404, "Invalid coupon code");
    return coupon;
  },

  async list() {
    return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  },

  async create(input: z.infer<typeof couponSchema>) {
    if (input.type === "PERCENT" && input.value > 90) throw new ApiError(422, "Percentage can't exceed 90%");
    return prisma.coupon.create({
      data: { ...input, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null },
    });
  },

  async update(id: string, input: z.infer<typeof couponSchema>) {
    if (input.type === "PERCENT" && input.value > 90) throw new ApiError(422, "Percentage can't exceed 90%");
    return prisma.coupon.update({
      where: { id },
      data: { ...input, expiresAt: input.expiresAt ? new Date(input.expiresAt) : null },
    });
  },

  async remove(id: string) {
    return prisma.coupon.delete({ where: { id } });
  },
};
