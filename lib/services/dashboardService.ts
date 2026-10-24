import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["PAID", "SHIPPED", "DELIVERED"] as const;

export const dashboardService = {
  async stats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const since = new Date(startOfToday);
    since.setDate(since.getDate() - 29);

    const [revenue, ordersToday, totalOrders, pendingToShip, customers, lowStock, recentOrders, last30] = await Promise.all([
      prisma.order.aggregate({ where: { status: { in: [...PAID_STATUSES] } }, _sum: { total: true } }),
      prisma.order.count({ where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { status: { in: [...PAID_STATUSES] } } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        select: { id: true, name: true, stock: true },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      prisma.order.findMany({
        where: { status: { not: "PENDING" } },
        select: { id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.order.findMany({
        where: { status: { in: [...PAID_STATUSES] }, createdAt: { gte: since } },
        select: { total: true, createdAt: true },
      }),
    ]);

    // daily sales for the last 30 days
    const byDay = new Map<string, { date: string; revenue: number; orders: number }>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, { date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }), revenue: 0, orders: 0 });
    }
    for (const o of last30) {
      const row = byDay.get(o.createdAt.toISOString().slice(0, 10));
      if (row) {
        row.revenue += o.total;
        row.orders += 1;
      }
    }

    return {
      totalRevenue: revenue._sum.total ?? 0,
      ordersToday,
      totalOrders,
      pendingToShip,
      customers,
      lowStock,
      recentOrders,
      sales: Array.from(byDay.values()),
    };
  },
};
