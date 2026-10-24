// import { clientIp, handle, ok, readJson } from "@/lib/api";
// import { getSession } from "@/lib/auth";
// import { rateLimit } from "@/lib/rateLimit";
// import { checkoutSchema } from "@/lib/validators";
// import { paymentService } from "@/lib/services/paymentService";

// /**
//  * Step 1 of payment: save a PENDING order and create a Razorpay Order.
//  * Works for guests (no login) and logged-in customers.
//  */
// export const POST = handle(async (req: Request) => {
//   rateLimit(`pay:${clientIp(req)}`, 10, 60_000);
//   const input = checkoutSchema.parse(await readJson(req));
//   const session = await getSession();
//   const data = await paymentService.createOrder(input, session?.sub ?? null);
//   return ok(data, 201);
// });

import { clientIp, handle, ok, readJson } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { checkoutSchema } from "@/lib/validators";
import { paymentService } from "@/lib/services/paymentService";

/**
 * Step 1 of payment: save a PENDING order and create a Razorpay Order.
 * Works for guests (no login) and logged-in customers.
 */
export const POST = handle(async (req: Request) => {
  rateLimit(`pay:${clientIp(req)}`, 10, 60_000);
  const input = checkoutSchema.parse(await readJson(req));
  const session = await getSession();
  // If the login cookie points to an account that no longer exists (e.g. database was reset),
  // place the order as a guest instead of failing.
  const userId = session ? (await prisma.user.findUnique({ where: { id: session.sub }, select: { id: true } }))?.id ?? null : null;
  const data = await paymentService.createOrder(input, userId);
  return ok(data, 201);
});
