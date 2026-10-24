import { handle, ok, readJson } from "@/lib/api";
import { getSession, requireUser, setSessionCookie } from "@/lib/auth";
import { profileSchema } from "@/lib/validators";
import { authService } from "@/lib/services/authService";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const session = await getSession();
  if (!session) return ok({ user: null });
  const user = await authService.me(session.sub);
  return ok({ user });
});

/** Update profile (name, phone) */
export const PUT = handle(async (req: Request) => {
  const session = await requireUser();
  const input = profileSchema.parse(await readJson(req));
  const updated = await authService.updateProfile(session.sub, { name: input.name, phone: input.phone || undefined });
  await setSessionCookie(updated);
  return ok({ user: await authService.me(session.sub) });
});
