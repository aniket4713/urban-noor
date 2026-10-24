import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { dashboardService } from "@/lib/services/dashboardService";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok(await dashboardService.stats());
});
