import { handle, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { orderService } from "@/lib/services/orderService";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const user = await requireUser();
  return ok({ orders: await orderService.listForUser(user.sub) });
});
