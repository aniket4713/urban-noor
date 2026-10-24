import { handle, ok } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export const POST = handle(async () => {
  clearSessionCookie();
  return ok({ ok: true });
});
