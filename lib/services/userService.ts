import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { addressSchema } from "@/lib/validators";

export const userService = {
  // ---- addresses ----
  async addresses(userId: string) {
    return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  },

  async addAddress(userId: string, input: z.infer<typeof addressSchema>) {
    const count = await prisma.address.count({ where: { userId } });
    if (count >= 10) throw new ApiError(400, "You can save up to 10 addresses");
    const makeDefault = input.isDefault || count === 0;
    if (makeDefault) await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return prisma.address.create({
      data: { ...input, line2: input.line2 || null, isDefault: makeDefault, userId },
    });
  },

  async deleteAddress(userId: string, id: string) {
    const res = await prisma.address.deleteMany({ where: { id, userId } });
    if (!res.count) throw new ApiError(404, "Address not found");
  },

  async setDefaultAddress(userId: string, id: string) {
    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.address.updateMany({ where: { id, userId }, data: { isDefault: true } }),
    ]);
  },

  // ---- admin ----
  async adminCustomers(params: { q?: string; page?: number; pageSize?: number }) {
    const where = {
      role: "CUSTOMER" as const,
      ...(params.q
        ? {
            OR: [
              { name: { contains: params.q, mode: "insensitive" as const } },
              { email: { contains: params.q, mode: "insensitive" as const } },
              { phone: { contains: params.q } },
            ],
          }
        : {}),
    };
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: { select: { orders: { where: { status: { not: "PENDING" } } } } },
          orders: { where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } }, select: { total: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);
    const items = users.map(({ orders, _count, ...u }) => ({
      ...u,
      orderCount: _count.orders,
      totalSpent: orders.reduce((s, o) => s + o.total, 0),
    }));
    return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  },
};
