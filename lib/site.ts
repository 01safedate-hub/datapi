export const site = {
  name: "Alaba",
  legalName: "Alaba Marketplace",
  tagline: "Buy direct from Nigerian manufacturers, importers and sellers.",
  description:
    "Alaba connects buyers directly to verified Nigerian manufacturers, importers and sellers. Fair prices without middlemen, Alaba Buyer Protection on every order, and delivery across Nigeria with GIG or Jumia.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://alaba.ng",
  domain: "alaba.ng",
  email: "support@alaba.ng",
  sellerEmail: "sellers@alaba.ng",
  phone: "+234 800 000 0000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000",
  address: "Ojo, Lagos, Nigeria",
  locale: "en_NG",
  themeColor: "#0a1a52",
  platformStoreSlug: "alaba-verified",
} as const;

export function whatsappLink(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsapp}${text}`;
}
