import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { PwaRegister } from "@/components/pwa-register";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Buy direct from Nigerian makers and sellers`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Alaba",
    "Alaba market online",
    "Nigerian marketplace",
    "buy from manufacturers Nigeria",
    "wholesale Nigeria",
    "made in Nigeria",
    "online shopping Nigeria",
    "imported products Lagos",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "shopping",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: site.url,
    title: `${site.name} — Buy direct from Nigerian makers and sellers`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Buy direct from Nigerian makers and sellers`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "default" },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: [{ color: site.themeColor }],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-center"
          closeButton
          richColors
          toastOptions={{ classNames: { toast: "font-sans" } }}
          offset={{ bottom: 24 }}
          mobileOffset={{ bottom: 76 }}
        />
        <PwaRegister />
      </body>
    </html>
  );
}
