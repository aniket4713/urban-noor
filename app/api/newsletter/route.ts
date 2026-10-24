import { z } from "zod";
import { clientIp, handle, ok, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { emailSchema } from "@/lib/validators";

export const POST = handle(async (req: Request) => {
  rateLimit(`news:${clientIp(req)}`, 5, 60_000);
  const { email } = z.object({ email: emailSchema }).parse(await readJson(req));
  await prisma.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email } });
  return ok({ message: "You're on the list ✦" });
});
