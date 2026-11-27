import "server-only";

/**
 * TMPI product import adapter. Reads TMPI_API_KEY (and TMPI_API_URL) on the
 * server only. Until the key and API docs are supplied, `searchTmpi` serves
 * sample results so the admin flow can be used end to end. When the docs
 * arrive, only `normalise` (field mapping) and the request path need filling in.
 */

export type ImportCandidate = {
  externalId: string;
  title: string;
  supplier: string;
  /** Price range in RMB (yuan). */
  priceRmb: [number, number];
  moq: number;
  rating: number;
  orders: number;
  weightKg: number | null;
  images: string[];
  variants: { options: Record<string, string>; priceRmb: number }[];
};

const sample: ImportCandidate[] = [
  { externalId: "TMPI-1600987711", title: "Wireless Earbuds ENC Bluetooth 5.4, 40h Playtime", supplier: "Shenzhen Soundwave Tech Co.", priceRmb: [38, 52], moq: 10, rating: 4.8, orders: 3120, weightKg: 0.15, images: [], variants: [{ options: { Colour: "Black" }, priceRmb: 38 }, { options: { Colour: "White" }, priceRmb: 40 }] },
  { externalId: "TMPI-1600954402", title: "Portable Mini Projector 1080P WiFi Android 11", supplier: "Guangzhou Beam Optics Ltd.", priceRmb: [310, 360], moq: 2, rating: 4.6, orders: 980, weightKg: 1.4, images: [], variants: [{ options: { Version: "Standard" }, priceRmb: 310 }, { options: { Version: "Android" }, priceRmb: 360 }] },
  { externalId: "TMPI-1601002371", title: "20000mAh Power Bank 22.5W PD Fast Charge LED Display", supplier: "Dongguan Volt Energy", priceRmb: [42, 49], moq: 20, rating: 4.7, orders: 5400, weightKg: 0.42, images: [], variants: [{ options: { Colour: "Black" }, priceRmb: 42 }] },
  { externalId: "TMPI-1600931140", title: "Men's Breathable Running Shoes Lightweight Knit", supplier: "Jinjiang Stride Footwear", priceRmb: [68, 85], moq: 6, rating: 4.5, orders: 2210, weightKg: 0.8, images: [], variants: [{ options: { Size: "42" }, priceRmb: 68 }, { options: { Size: "44" }, priceRmb: 72 }] },
  { externalId: "TMPI-1600899123", title: "Smart Watch 1.96\" AMOLED Bluetooth Call IP68", supplier: "Shenzhen Fitly Wearables", priceRmb: [92, 118], moq: 5, rating: 4.6, orders: 4300, weightKg: 0.2, images: [], variants: [{ options: { Strap: "Silicone" }, priceRmb: 92 }, { options: { Strap: "Steel" }, priceRmb: 118 }] },
  { externalId: "TMPI-1600877650", title: "6L Digital Air Fryer Oil-Free 1700W", supplier: "Ningbo HomeChef Appliances", priceRmb: [148, 172], moq: 4, rating: 4.4, orders: 760, weightKg: 5.2, images: [], variants: [{ options: { Plug: "UK" }, priceRmb: 148 }] },
];

export const tmpiConfigured = () => Boolean(process.env.TMPI_API_KEY && process.env.TMPI_API_URL);

/** Map one TMPI item to our shape. Fill in once the TMPI response format is known. */
function normalise(item: Record<string, unknown>): ImportCandidate {
  const n = (k: string) => Number(item[k] ?? 0);
  const s = (k: string) => String(item[k] ?? "");
  return {
    externalId: `TMPI-${s("id")}`,
    title: s("title"),
    supplier: s("supplier"),
    priceRmb: [n("price_min"), n("price_max") || n("price_min")],
    moq: n("moq") || 1,
    rating: n("rating"),
    orders: n("orders"),
    weightKg: item.weight_kg != null ? n("weight_kg") : null,
    images: Array.isArray(item.images) ? (item.images as string[]) : [],
    variants: [],
  };
}

export async function searchTmpi(query: string): Promise<{ results: ImportCandidate[]; live: boolean }> {
  const q = query.trim().toLowerCase();
  if (!tmpiConfigured()) {
    await new Promise((r) => setTimeout(r, 500));
    const words = q.split(/\s+/).filter(Boolean);
    return { results: words.length ? sample.filter((r) => words.some((w) => r.title.toLowerCase().includes(w))) : sample, live: false };
  }
  const url = new URL("/products/search", process.env.TMPI_API_URL);
  url.searchParams.set("q", q);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.TMPI_API_KEY}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`TMPI search failed (${res.status})`);
  const body = (await res.json()) as { items?: Record<string, unknown>[] };
  return { results: (body.items ?? []).map(normalise), live: true };
}

export async function getTmpiProduct(externalId: string) {
  if (!tmpiConfigured()) return sample.find((s) => s.externalId === externalId) ?? null;
  const url = new URL(`/products/${encodeURIComponent(externalId.replace(/^TMPI-/, ""))}`, process.env.TMPI_API_URL);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${process.env.TMPI_API_KEY}` }, cache: "no-store", signal: AbortSignal.timeout(10_000) });
  if (!res.ok) return null;
  return normalise((await res.json()) as Record<string, unknown>);
}
