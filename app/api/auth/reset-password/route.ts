import { clientIp, handle, ok, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";
import { resetSchema } from "@/lib/validators";
import { authService } from "@/lib/services/authService";

export const POST = handle(async (req: Request) => {
  rateLimit(`reset:${clientIp(req)}`, 5, 60_000);
  const input = resetSchema.parse(await readJson(req));
  await authService.resetPassword(input);
  return ok({ message: "Password updated. You can now log in." });
});
