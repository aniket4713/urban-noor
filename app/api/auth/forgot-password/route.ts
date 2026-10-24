import { clientIp, handle, ok, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { forgotSchema } from "@/lib/validators";
import { authService } from "@/lib/services/authService";

export const POST = handle(async (req: Request) => {
  rateLimit(`forgot:${clientIp(req)}`, 3, 60_000);
  const { email } = forgotSchema.parse(await readJson(req));
  await authService.forgotPassword(email);
  // Same response either way so nobody can check which emails are registered
  return ok({ message: "If an account exists for that email, a reset link is on its way." });
});
