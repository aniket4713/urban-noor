import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { settingsService } from "@/lib/services/settingsService";

export const revalidate = 300;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await settingsService.getSafe();
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar text={settings.announcement} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
      <WhatsAppButton number={settings.whatsappNumber} />
    </div>
  );
}
