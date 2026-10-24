import { clientIp, handle, ok, readJson } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/validators";
import { authService } from "@/lib/services/authService";

export const POST = handle(async (req: Request) => {
  rateLimit(`login:${clientIp(req)}`, 10, 60_000);
  const body = await readJson<Record<string, unknown>>(req);
  const input = loginSchema.parse(body);
  const session = await authService.login(input, { adminOnly: body.admin === true });
  await setSessionCookie(session);
  return ok({ user: { id: session.sub, name: session.name, email: session.email, role: session.role } });
});
