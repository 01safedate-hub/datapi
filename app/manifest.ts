import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${site.name} — Shop imported and local`,
    short_name: site.name,
    description: site.description,
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: site.themeColor,
    lang: "en-NG",
    dir: "ltr",
    categories: ["shopping", "lifestyle"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Search", url: "/search", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Track an order", url: "/track", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "My orders", url: "/account/orders", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Messages", url: "/messages", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Cart", url: "/cart", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
    screenshots: [
      { src: "/screenshots/home-mobile.png", sizes: "390x844", type: "image/png", form_factor: "narrow", label: "Alaba home" },
      { src: "/screenshots/home-desktop.png", sizes: "1440x900", type: "image/png", form_factor: "wide", label: "Alaba home" },
    ],
  };
}
