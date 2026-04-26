import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/Toaster";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-data",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Soil Intelligence — Precision Soil Diagnostics for European Farmers",
    template: "%s | Soil Intelligence",
  },
  description:
    "AI-powered soil health analysis and EU compliance reporting. Order soil testing, receive actionable recommendations, and demonstrate compliance with EU Soil Monitoring Law — without owning a single sensor.",
  keywords: [
    "soil testing Lithuania", "precision agriculture", "EU soil monitoring",
    "NPK analysis", "soil health score", "farm compliance", "sensor as a service",
    "agronomic consultation", "fertilizer recommendations",
  ],
  authors: [{ name: "Soil Intelligence", url: "https://soilintelligence.lt" }],
  creator: "Soil Intelligence",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://soilintelligence.lt",
    siteName: "Soil Intelligence",
    title: "Soil Intelligence — Sensor-as-a-Service for Lithuanian Farmers",
    description: "Professional soil diagnostics without the hardware investment.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soil Intelligence",
    description: "AI-powered soil diagnostics. EU compliant. No equipment required.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1e6b1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
