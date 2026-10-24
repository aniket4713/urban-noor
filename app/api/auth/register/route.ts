import { clientIp, handle, ok, readJson } from "@/lib/api";
import { setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { registerSchema } from "@/lib/validators";
import { authService } from "@/lib/services/authService";

export const POST = handle(async (req: Request) => {
  rateLimit(`register:${clientIp(req)}`, 5, 60_000);
  const input = registerSchema.parse(await readJson(req));
  const session = await authService.register(input);
  await setSessionCookie(session);
  return ok({ user: { id: session.sub, name: session.name, email: session.email, role: session.role } }, 201);
});
