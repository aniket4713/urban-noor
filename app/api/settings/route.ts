import { handle, ok } from "@/lib/api";
import { settingsService } from "@/lib/services/settingsService";

export const dynamic = "force-dynamic";

/** Public store settings (shipping rules etc.) */
export const GET = handle(async () => {
  const s = await settingsService.get();
  return ok({
    settings: {
      shippingFee: s.shippingFee,
      freeShippingThreshold: s.freeShippingThreshold,
      whatsappNumber: s.whatsappNumber,
    },
  });
});
