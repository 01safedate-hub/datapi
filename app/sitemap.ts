import type { MetadataRoute } from "next";
import { getCategories, queryProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

const staticPages = [
  "", "/shop", "/how-it-works", "/shipping", "/faq", "/about", "/contact", "/track",
  "/privacy", "/terms", "/refund-policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...staticPages.map((p) => ({
      url: `${site.url}${p}`,
      lastModified: now,
      changeFrequency: p === "" || p === "/shop" ? ("daily" as const) : ("monthly" as const),
      priority: p === "" ? 1 : p === "/shop" ? 0.9 : 0.4,
    })),
    ...getCategories().map((c) => ({
      url: `${site.url}/c/${c.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...queryProducts().map((p) => ({
      url: `${site.url}/p/${p.slug}`,
      lastModified: new Date(p.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.slice(0, 1).map((i) => `${site.url}${i}`),
    })),
  ];
}
