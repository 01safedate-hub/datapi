export const site = {
  name: "Shupzy",
  tagline: "Imported and local products, priced in naira.",
  description:
    "Shop thousands of products imported from China and sourced locally. Clear naira prices, shipping shown upfront, and tracking from warehouse to your door anywhere in Nigeria.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://shupzy.com",
  email: "support@shupzy.com",
  phone: "+234 800 000 0000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "2348000000000",
  address: "Ikeja, Lagos, Nigeria",
  locale: "en_NG",
  themeColor: "#0b1b3f",
} as const;

export function whatsappLink(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${site.whatsapp}${text}`;
}
