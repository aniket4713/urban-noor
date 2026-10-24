import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { revalidateAll } from "@/lib/revalidate";
import { settingsSchema } from "@/lib/validators";
import { settingsService } from "@/lib/services/settingsService";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok({ settings: await settingsService.get() });
});

export const PUT = handle(async (req: Request) => {
  await requireAdmin();
  const settings = await settingsService.update(settingsSchema.parse(await readJson(req)));
  revalidateAll();
  return ok({ settings });
});
