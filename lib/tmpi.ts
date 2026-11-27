import "server-only";

/**
 * China import via TMAPI, called through the Supabase Edge Function `tmapi`.
 * The TMAPI key is a Supabase secret (TMAPI_KEY) and never reaches this app.
 * This server authenticates to the function with SUPABASE_SECRET_KEY.
 * Without those env vars, sample results are served so the admin flow still works.
 */

export type ImportSource = "alibaba" | "1688";

export type ImportCandidate = {
  externalId: string;
  source: ImportSource;
  title: string;
  supplier: string;
  image: string | null;
  /** Price range in RMB (yuan). */
  priceRmb: [number, number];
  moq: number;
  rating: number;
  orders: number;
  verified: boolean;
};

export type ImportResult =
  | { ok: true; updated: boolean; product: { id: string; slug: string; name: string; status: string }; variants: number; images: number; weightKg: number }
  | { ok: false; msg: string; needsWeight?: boolean };

const sample: ImportCandidate[] = [
  { externalId: "sample:1", source: "alibaba", title: "Wireless Earbuds ENC Bluetooth 5.4, 40h Playtime", supplier: "Shenzhen Soundwave Tech Co.", image: null, priceRmb: [38, 52], moq: 10, rating: 4.8, orders: 3120, verified: true },
  { externalId: "sample:2", source: "alibaba", title: "Portable Mini Projector 1080P WiFi Android 11", supplier: "Guangzhou Beam Optics Ltd.", image: null, priceRmb: [310, 360], moq: 2, rating: 4.6, orders: 980, verified: true },
  { externalId: "sample:3", source: "alibaba", title: "20000mAh Power Bank 22.5W PD Fast Charge LED Display", supplier: "Dongguan Volt Energy", image: null, priceRmb: [42, 49], moq: 20, rating: 4.7, orders: 5400, verified: false },
  { externalId: "sample:4", source: "alibaba", title: "Smart Watch 1.96\" AMOLED Bluetooth Call IP68", supplier: "Shenzhen Fitly Wearables", image: null, priceRmb: [92, 118], moq: 5, rating: 4.6, orders: 4300, verified: true },
];

export const tmpiConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);

async function callFunction<T>(body: Record<string, unknown>, timeoutMs = 60_000): Promise<T> {
  const key = process.env.SUPABASE_SECRET_KEY!;
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tmapi`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (res.status === 401) throw new Error("Import service refused this server. Check SUPABASE_SECRET_KEY in Netlify");
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (data && typeof data === "object" && "error" in data && data.error) throw new Error(String(data.error));
  return data;
}

export async function searchTmpi(query: string, source: ImportSource = "alibaba", page = 1): Promise<{ results: ImportCandidate[]; live: boolean }> {
  const q = query.trim();
  if (!tmpiConfigured()) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return { results: words.length ? sample.filter((r) => words.some((w) => r.title.toLowerCase().includes(w))) : sample, live: false };
  }
  const r = await callFunction<{ ok: boolean; msg: string; results: ImportCandidate[] }>({ action: "search", keyword: q, source, page });
  if (!r.ok) throw new Error(r.msg === "no permission; subscribe in the console first" ? `Your TMAPI plan doesn't include ${source === "1688" ? "1688" : "Alibaba"} search` : r.msg || "Search failed");
  return { results: r.results, live: true };
}

export async function importTmpi(args: { externalId: string; category: string; brand: string; deliveryMin: number; deliveryMax: number; weightKg?: number }): Promise<ImportResult> {
  if (!tmpiConfigured() || args.externalId.startsWith("sample:")) return { ok: false, msg: "Sample results can't be imported. Connect Supabase to import real products." };
  return callFunction<ImportResult>(
    { action: "import", id: args.externalId, category: args.category, brand: args.brand, delivery_min: args.deliveryMin, delivery_max: args.deliveryMax, ...(args.weightKg ? { weight_kg: args.weightKg } : {}) },
    120_000,
  );
}
