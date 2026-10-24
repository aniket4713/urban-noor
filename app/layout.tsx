import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Poppins } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Urban Noor — Artificial Jewellery for Men & Women",
    template: "%s | Urban Noor",
  },
  description:
    "Shop statement artificial jewellery for men and women — kundan sets, jhumkas, chains, kadas, rings and more. Anti-tarnish, skin-friendly, delivered across India.",
  keywords: ["artificial jewellery", "imitation jewellery", "jewellery for men", "kundan", "jhumka", "kada", "Urban Noor"],
  openGraph: {
    type: "website",
    siteName: "Urban Noor",
    locale: "en_IN",
    images: ["/seed/hero.jpg"],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
