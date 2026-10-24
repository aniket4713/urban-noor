import { clientIp, handle, ok, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { trackOrderSchema } from "@/lib/validators";
import { orderService } from "@/lib/services/orderService";

/** Guest order tracking: POST { orderNumber, contact (email or phone) } */
export const POST = handle(async (req: Request) => {
  rateLimit(`track:${clientIp(req)}`, 10, 60_000);
  const { orderNumber, contact } = trackOrderSchema.parse(await readJson(req));
  const o = await orderService.track(orderNumber, contact);
  return ok({
    order: {
      orderNumber: o.orderNumber,
      status: o.status,
      createdAt: o.createdAt,
      total: o.total,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      discount: o.discount,
      courier: o.courier,
      trackingNumber: o.trackingNumber,
      city: o.city,
      items: o.items.map((i) => ({ name: i.name, image: i.image, price: i.price, quantity: i.quantity })),
    },
  });
});
