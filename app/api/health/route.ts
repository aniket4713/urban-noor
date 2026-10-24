import { prisma } from "@/lib/prisma";
import { handle, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "unreachable";
  }
  return ok({ status: "ok", db, time: new Date().toISOString() });
});
