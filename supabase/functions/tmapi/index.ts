/* eslint-disable @typescript-eslint/no-explicit-any -- TMAPI payloads are untyped supplier JSON */
// TMAPI gateway for Alaba's China imports (1688 and Alibaba.com). The API key never leaves Supabase.
//
// POST /functions/v1/tmapi
//   { "action": "search", "keyword": "power bank", "source": "alibaba" (default) | "1688", "page": 1 }
//   { "action": "detail", "id": "1688:652702302959" }                     // or "alibaba:<url>"
//   { "action": "import", "id": "1688:652702302959", "category": "electronics", "brand": "Generic",
//     "delivery_min": 10, "delivery_max": 18, "weight_kg": 0.5 }          // weight only if the supplier gives none
//
// Imports are saved as DRAFT products on the Alaba Verified store, source "imported", tagged
// "imported", with supplier prices in fen per variant. Re-importing refreshes the same product.
//
// Auth (verify_jwt is off; checked here):
//   - the Alaba server, sending the Supabase secret key as `apikey`, or
//   - a signed-in staff user (super_admin or a role with the "products" permission), or
//   - the x-task-token header (value in public.internal_tokens, for scheduled jobs).
// Secret: TMAPI_KEY (TMPI_API_KEY also accepted).

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const TMAPI_KEY = Deno.env.get("TMAPI_KEY") ?? Deno.env.get("TMPI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HOSTS = ["https://api.tmapi.top", "http://api.tmapi.top"];
const CNY_PER_USD_DEFAULT = 7.2;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// ---- Auth ---------------------------------------------------------------------------
async function authorised(req: Request, db: SupabaseClient): Promise<boolean> {
  // Scheduled jobs and database calls send the "tasks" token from public.internal_tokens.
  const task = req.headers.get("x-task-token");
  if (task) {
    const { data } = await db.from("internal_tokens").select("token").eq("name", "tasks").single();
    return !!data && data.token === task;
  }
  const key = req.headers.get("apikey") ?? "";
  // A secret/service key bypasses RLS, so it can read `settings` (RLS on, no policies). Publishable keys can't.
  if (key && !key.startsWith("sb_publishable_")) {
    const probe = createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
    const { data } = await probe.from("settings").select("key").limit(1);
    if (data?.length) return true;
  }
  const jwt = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!jwt || jwt === key) return false;
  const { data: u } = await db.auth.getUser(jwt);
  if (!u?.user) return false;
  const { data: p } = await db.from("profiles").select("staff_role").eq("id", u.user.id).single();
  if (!p?.staff_role) return false;
  if (p.staff_role === "super_admin") return true;
  const { data: rp } = await db.from("role_permissions").select("permission").eq("role", p.staff_role).eq("permission", "products");
  return !!rp?.length;
}

// ---- TMAPI client ---------------------------------------------------------------------
let workingHost: string | null = null;
type Api = { ok: boolean; status: number; code: number | null; msg: string; data: any; limits: Record<string, string> };

// The key allows one request at a time, so "busy" answers are retried after a pause.
async function tmapi(db: SupabaseClient, path: string, params: Record<string, string | number>, body?: unknown): Promise<Api> {
  for (let attempt = 0; ; attempt++) {
    const r = await tmapiOnce(db, path, params, body);
    if (attempt >= 3 || !(r.code === 4291 || r.code === 417)) return r;
    await new Promise((ok) => setTimeout(ok, 1500 * (attempt + 1)));
  }
}

async function tmapiOnce(db: SupabaseClient, path: string, params: Record<string, string | number>, body?: unknown): Promise<Api> {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
  let lastErr = "";
  for (const host of workingHost ? [workingHost] : HOSTS) {
    const started = Date.now();
    try {
      const res = await fetch(`${host}${path}${qs ? `?${qs}` : ""}`, {
        method: body ? "POST" : "GET",
        headers: { apikey: TMAPI_KEY, ...(body ? { "Content-Type": "application/json" } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(25_000),
      });
      const text = await res.text();
      let data: { code?: number; msg?: string; message?: string; data?: unknown } = {};
      try { data = JSON.parse(text); } catch { data = { msg: text.slice(0, 300) }; }
      const msg = data.msg ?? data.message ?? (data.code === 200 ? "success" : text.slice(0, 300));
      await db.from("api_calls").insert({
        endpoint: path, params: { ...params, host }, http_status: res.status, api_code: data.code ?? null, message: msg, duration_ms: Date.now() - started,
      });
      workingHost = host;
      const limits = Object.fromEntries([...res.headers].filter(([k]) => /quota|limit|remain|balance|credit|usage/i.test(k)));
      return { ok: res.ok && data.code === 200, status: res.status, code: data.code ?? null, msg, data: data.data ?? null, limits };
    } catch (e) {
      lastErr = `${host}: ${(e as Error).message}`;
    }
  }
  return { ok: false, status: 0, code: null, msg: lastErr, data: null, limits: {} };
}

// ---- Helpers ---------------------------------------------------------------------------
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
};
const https = (u?: string | null) => (u ? u.replace(/^\/\//, "https://").replace(/^http:\/\//, "https://") : null);
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").slice(0, 60).replace(/-$/, "");

function parseProps(propsNames?: string) {
  const out: Record<string, string> = {};
  for (const part of (propsNames ?? "").split(";")) {
    const [k, ...v] = part.split(":");
    if (k && v.length) out[k.trim()] = v.join(":").trim();
  }
  return out;
}

// Supplier titles are keyword lists ("2025 Hot Selling Wholesale OEM ..."). Keep the product words.
function cleanTitle(t: string) {
  const out = t
    .replace(/\b(20\d\d|new arrivals?|hot[- ]?sell(ing|er)?s?|hot[- ]?sale|best[- ]?sell(ing|er)s?|wholesale|factory( direct| price)?|custom(ized)? logo|oem|odm|cheap|free shipping|dropshipping|high quality|top quality|in stock|ready to ship|manufacturers?|suppliers?)\b/gi, " ")
    .replace(/\b[A-Z]{2,}[-_]?\d{2,}[A-Z0-9-]*\b/g, " ")
    .replace(/\s+([,/&])/g, "$1").replace(/\s{2,}/g, " ").replace(/^[\s,/&-]+|[\s,/&-]+$/g, "").trim();
  // Cut at a word boundary, then drop dangling joiners ("…Power Bank with").
  const short = (out.length > 90 ? out.slice(0, 90).replace(/\s+\S*$/, "") : out).replace(/(\s+(with|and|for|of|in|to|by|&|\+|-))+$/i, "").replace(/[,\s]+$/, "");
  return short ? short[0]!.toUpperCase() + short.slice(1) : t.slice(0, 90);
}

async function cnyPerUsd(db: SupabaseClient) {
  const { data } = await db.from("settings").select("value").eq("key", "cny_per_usd").maybeSingle();
  return num(data?.value) ?? CNY_PER_USD_DEFAULT;
}

/** Our shape, same as lib/tmpi.ts ImportCandidate (plus variants with supplier SKU ids). */
type Candidate = {
  externalId: string; source: "1688" | "alibaba"; url: string | null; title: string; supplier: string;
  priceRmb: [number, number]; moq: number; rating: number; orders: number; weightKg: number | null;
  images: string[]; videoUrl: string | null; specs: [string, string][];
  options: { name: string; values: string[] }[];
  variants: { supplierSku: string; options: Record<string, string>; priceRmb: number; stock: number }[];
};

function fromDetail(d: any, source: "1688" | "alibaba", fx: number): Candidate {
  const toCny = (v: unknown) => { const n = num(v) ?? 0; return source === "alibaba" ? Math.round(n * fx * 100) / 100 : n; };
  const tiers = ((source === "alibaba" ? d.tiered_price_info : d.tiered_price_info?.prices) ?? []) as any[];
  const tierPrices = tiers.map((t) => num(t.price)).filter((n): n is number => !!n);
  // One piece costs the first tier on Alibaba; sku prices there are the bulk price.
  const single = tierPrices.length ? tierPrices[0]! : num(d.price_info?.price_max ?? d.price_info?.price) ?? 0;
  const lowest = tierPrices.length ? Math.min(...tierPrices) : num(d.price_info?.price_min ?? d.price_info?.price) ?? single;
  const bump = source === "alibaba" && single && lowest ? single / lowest : 1;

  const optionProps = ((d.sku_props ?? []) as any[]).filter((p) => (p.values ?? []).length > 1);
  const options = optionProps.map((p) => ({ name: String(p.prop_name), values: (p.values ?? []).map((v: any) => String(v.name)) }));
  const names = new Set(options.map((o) => o.name));
  const rawSkus = (d.skus?.length ? d.skus : [{ skuid: "default", sale_price: lowest, stock: d.stock ?? -1 }]) as any[];
  const byKey = new Map<string, Candidate["variants"][number]>();
  for (const s of rawSkus.slice(0, 80)) {
    const opts = Object.fromEntries(Object.entries(parseProps(s.props_names)).filter(([k]) => names.has(k)));
    const v = { supplierSku: String(s.skuid), options: opts, priceRmb: toCny((num(s.sale_price) ?? lowest) * bump), stock: (num(s.stock) ?? -1) < 0 ? 999 : Math.round(num(s.stock)!) };
    const key = JSON.stringify(opts);
    const had = byKey.get(key);
    // Variants that differ only in hidden props collapse to one: keep the dearest so we never sell below cost.
    if (!had || v.priceRmb > had.priceRmb) byKey.set(key, v);
  }
  const weight = num(d.delivery_info?.unit_weight);
  const shop = d.shop_info ?? {};
  return {
    externalId: `${source}:${d.item_id}`,
    source,
    url: d.product_url ?? (source === "1688" ? `https://detail.1688.com/offer/${d.item_id}.html` : null),
    title: cleanTitle(String(d.title ?? `Item ${d.item_id}`)),
    supplier: String(shop.shop_name ?? shop.company_name ?? shop.seller_login_id ?? ""),
    priceRmb: [toCny(lowest), toCny(single)],
    moq: Math.max(1, num(d.min_order_quantity) ?? num(tiers[0]?.beginAmount) ?? 1),
    rating: num(d.review_info?.rating_star) ?? 0,
    orders: Math.round(num(d.sale_count ?? d.sales_count) ?? 0),
    weightKg: weight && weight > 0 ? weight : null,
    images: ((d.main_imgs ?? []) as string[]).map(https).filter(Boolean).slice(0, 8) as string[],
    videoUrl: https(d.video_url),
    specs: ((d.product_props ?? []) as any[])
      .map((p) => (p.key ? [String(p.key), String(p.value)] : Object.entries(p)[0]?.map(String)) as [string, string])
      .filter((p) => p?.[0] && p[1] && !/brand|model|品牌/i.test(p[0])).slice(0, 12),
    options,
    variants: [...byKey.values()],
  };
}

async function fetchDetail(db: SupabaseClient, id: string): Promise<{ ok: true; c: Candidate } | { ok: false; msg: string }> {
  const [source, ...rest] = id.split(":");
  const ref = rest.join(":");
  if (source === "1688") {
    if (!/^\d{6,20}$/.test(ref)) return { ok: false, msg: "Bad 1688 item id" };
    const r = await tmapi(db, "/1688/item_detail", { item_id: ref, language: "en" });
    return r.ok ? { ok: true, c: fromDetail(r.data, "1688", 1) } : { ok: false, msg: r.msg };
  }
  if (source === "alibaba") {
    if (!/^https:\/\/(www\.)?alibaba\.com\/product-detail\//.test(ref)) return { ok: false, msg: "Bad Alibaba product link" };
    const r = await tmapi(db, "/alibaba/item_detail_by_url", {}, { url: ref, currency: "USD" });
    return r.ok ? { ok: true, c: fromDetail(r.data, "alibaba", await cnyPerUsd(db)) } : { ok: false, msg: r.msg };
  }
  return { ok: false, msg: "Unknown source" };
}

// Copies a supplier photo into our bucket (year-long cache). Falls back to the original URL.
async function mirror(db: SupabaseClient, url: string, path: string) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36", Accept: "image/webp,image/jpeg,image/png;q=0.9,*/*;q=0.5" }, signal: AbortSignal.timeout(15_000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return url;
    const ext = type.split("/")[1]!.replace("jpeg", "jpg").replace(/[^a-z]/g, "");
    const file = `${path}.${ext}`;
    const { error } = await db.storage.from("product-images").upload(file, new Uint8Array(await res.arrayBuffer()), { contentType: type, upsert: true, cacheControl: "31536000" });
    return error ? url : db.storage.from("product-images").getPublicUrl(file).data.publicUrl;
  } catch {
    return url;
  }
}

async function importProduct(db: SupabaseClient, input: Record<string, any>) {
  const category = String(input.category ?? "");
  const brandName = String(input.brand ?? "").trim();
  const dmin = Math.round(num(input.delivery_min) ?? 10), dmax = Math.round(num(input.delivery_max) ?? 18);
  if (!category) return { ok: false, msg: "Choose a category" };
  if (!brandName) return { ok: false, msg: "Brand is required" };
  if (dmin < 1 || dmax < dmin || dmax > 120) return { ok: false, msg: "Check the delivery days" };
  const { data: cat } = await db.from("categories").select("slug").eq("slug", category).maybeSingle();
  if (!cat) return { ok: false, msg: `Unknown category ${category}` };
  const { data: store } = await db.from("stores").select("id").eq("is_platform", true).single();
  if (!store) return { ok: false, msg: "Alaba Verified store is missing" };

  const det = await fetchDetail(db, String(input.id ?? ""));
  if (!det.ok) return det;
  const c = det.c;
  const weightKg = c.weightKg ?? num(input.weight_kg);
  if (!weightKg || weightKg <= 0) return { ok: false, msg: "The supplier gives no shipping weight. Enter one to import.", needsWeight: true };

  const brandSlug = slugify(brandName) || "generic";
  await db.from("brands").upsert({ slug: brandSlug, name: brandName }, { onConflict: "slug", ignoreDuplicates: true });

  const ext = c.externalId.startsWith("1688:") ? c.externalId : `alibaba:${c.url?.match(/(\d{8,})/)?.[1] ?? slugify(c.url ?? "")}`;
  const key = ext.split(":")[1]!;
  const { data: had } = await db.from("products").select("id, slug, name, status").eq("source", "imported").eq("external_id", ext).maybeSingle();
  const row = {
    category, brand: brandName, brand_slug: brandSlug, store_id: store.id, source: "imported", origin: c.source === "1688" ? "1688" : "alibaba",
    external_id: ext, supplier_price_fen: Math.round(c.priceRmb[0] * 100), est_weight_g: Math.round(weightKg * 1000),
    moq: 1, delivery_days: `[${dmin},${dmax}]`, options: c.options, specs: Object.fromEntries(c.specs),
    tags: ["imported"], condition: "new", stock: 0,
  };
  // Re-importing refreshes prices, specs and variants, but keeps what staff edited: name, slug, description, status.
  const { data: saved, error } = had
    ? await db.from("products").update(row).eq("id", had.id).select("id, slug, name, status").single()
    : await db.from("products").insert({ ...row, name: c.title, slug: `${slugify(c.title) || "item"}-${key.slice(-10)}`, status: "draft" })
      .select("id, slug, name, status").single();
  if (error) return { ok: false, msg: `Saving product: ${error.message}` };

  const variants = c.variants.map((v, i) => ({
    product_id: saved.id, sku: `ALB-${key.slice(-8)}-${String(i + 1).padStart(2, "0")}`, options: v.options,
    supplier_price_fen: Math.round(v.priceRmb * 100), stock: 999, active: true,
  }));
  await db.from("product_variants").delete().eq("product_id", saved.id);
  const { error: vErr } = await db.from("product_variants").insert(variants);
  if (vErr) return { ok: false, msg: `Saving variants: ${vErr.message}` };

  const images: string[] = [];
  for (const [i, u] of c.images.slice(0, 6).entries()) images.push(await mirror(db, u, `tmapi/${key}/${i}`));
  await db.from("product_media").delete().eq("product_id", saved.id);
  if (images.length) await db.from("product_media").insert(images.map((path, sort) => ({ product_id: saved.id, path, sort })));

  return {
    ok: true, updated: !!had, product: saved, variants: variants.length, images: images.length,
    mirrored: images.filter((u) => u.includes("/storage/v1/")).length, deliveryDays: [dmin, dmax], weightKg,
  };
}

// ---- Handler ----------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  if (!(await authorised(req, db))) return json({ error: "Not allowed" }, 401);
  if (!TMAPI_KEY) return json({ error: "TMAPI_KEY secret is not set in Supabase" }, 500);

  let input: Record<string, any> = {};
  try { input = await req.json(); } catch { /* empty body */ }

  try {
    if (input.action === "search") {
      const keyword = String(input.keyword ?? "").trim().slice(0, 100);
      if (!keyword) return json({ ok: false, msg: "Enter a search term" }, 400);
      const page = Math.max(1, Math.min(50, num(input.page) ?? 1));
      // Alibaba.com is the default: it's what this TMAPI plan includes. 1688 needs a separate subscription.
      if (input.source !== "1688") {
        const fx = await cnyPerUsd(db);
        const r = await tmapi(db, "/alibaba/search/items", { keywords: keyword, page });
        const results = ((r.data?.items ?? []) as any[]).map((it) => ({
          externalId: `alibaba:${String(it.product_url ?? "").split("?")[0]}`, source: "alibaba", title: cleanTitle(String(it.title ?? "")),
          supplier: String(it.shop_info?.company_name ?? ""), image: https(it.img ?? it.main_img ?? it.image_url),
          priceRmb: [Math.round((num(it.price_info?.price_min) ?? 0) * fx * 100) / 100, Math.round((num(it.price_info?.price_max) ?? num(it.price_info?.price_min) ?? 0) * fx * 100) / 100],
          moq: num(it.min_order_quantity) ?? 1, rating: num(it.review_info?.rating_score) ?? 0, orders: 0, verified: it.shop_info?.is_verified_supplier === true,
        }));
        return json({ ok: r.ok, msg: r.msg, limits: r.limits, results });
      }
      const r = await tmapi(db, "/1688/global/search/items", { keyword, page, page_size: 20, language: "en" });
      const results = ((r.data?.items ?? []) as any[]).map((it) => ({
        externalId: `1688:${it.item_id}`, source: "1688", title: cleanTitle(String(it.title ?? "")), supplier: String(it.shop_info?.shop_name ?? ""),
        image: https(it.img), priceRmb: [num(it.price_info?.price_min ?? it.price) ?? 0, num(it.price_info?.price_max ?? it.price) ?? 0],
        moq: num(it.min_order_quantity ?? it.quantity_begin) ?? 1, rating: 0, orders: Math.round(num(it.sale_info?.sale_quantity_90days) ?? 0), verified: false,
      }));
      return json({ ok: r.ok, msg: r.msg, limits: r.limits, results });
    }

    if (input.action === "detail") {
      const d = await fetchDetail(db, String(input.id ?? ""));
      return d.ok ? json({ ok: true, candidate: d.c }) : json({ ok: false, msg: d.msg }, 502);
    }

    if (input.action === "import") {
      const out = await importProduct(db, input);
      return json(out, out.ok ? 200 : 422);
    }

    return json({ error: "Unknown action. Use search, detail or import." }, 400);
  } catch (e) {
    return json({ ok: false, msg: (e as Error).message }, 500);
  }
});
