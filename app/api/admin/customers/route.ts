import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { userService } from "@/lib/services/userService";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const sp = new URL(req.url).searchParams;
  return ok(
    await userService.adminCustomers({
      q: sp.get("q") || undefined,
      page: Math.max(1, Number(sp.get("page")) || 1),
    })
  );
});
