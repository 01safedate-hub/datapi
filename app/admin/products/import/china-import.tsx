"use client";

import { BadgeCheck, Check, Download, ImageOff, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Badge, Card, EmptyState } from "@/components/ui/misc";
import { pricingSettings } from "@/lib/data/settings";
import type { ImportCandidate, ImportSource } from "@/lib/tmpi";
import { cn, formatNaira } from "@/lib/utils";
import { importAsDraft, searchImports } from "./actions";

export function ChinaImport({ categories, defaultDays }: { categories: { slug: string; name: string }[]; defaultDays: [number, number] }) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState<ImportSource>("alibaba");
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<ImportCandidate[] | null>(null);
  const [imported, setImported] = useState<Map<string, string>>(new Map());
  const [cat, setCat] = useState<Record<string, string>>({});
  const [brand, setBrand] = useState<Record<string, string>>({});
  const [weight, setWeight] = useState<Record<string, string>>({});
  const [needsWeight, setNeedsWeight] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [days, setDays] = useState<[number, number]>(defaultDays);
  const [live, setLive] = useState(false);
  const [searching, startSearch] = useTransition();
  const [, startImport] = useTransition();

  const search = (p: number) =>
    startSearch(async () => {
      const res = await searchImports(q, source, p);
      if (!res.ok) return void toast.error(res.message);
      setResults(res.results);
      setLive(res.live);
      setPage(p);
    });

  return (
    <div className="grid gap-5">
      <form
        className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          search(1);
        }}
      >
        <div role="radiogroup" aria-label="Catalogue" className="flex rounded-lg border border-gray-300 p-0.5">
          {(["alibaba", "1688"] as const).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={source === s} onClick={() => setSource(s)} className={cn("h-9 rounded-md px-3 text-sm font-medium", source === s ? "bg-navy-900 text-white" : "text-gray-700 hover:bg-gray-100")}>
              {s === "alibaba" ? "Alibaba.com" : "1688"}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <Input aria-label="Search supplier catalogue" placeholder="e.g. earbuds, power bank, sneakers" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit" loading={searching} loadingText="Searching…">Search</Button>
      </form>

      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="grid gap-1">
          <span className="text-sm font-medium">Delivery timeframe shown to buyers</span>
          <span className="text-xs text-gray-500">Applied to every product you import now. Editable per product later.</span>
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <Input type="number" min={1} max={90} value={days[0]} onChange={(e) => setDays([Number(e.target.value), days[1]])} className="h-9 w-20" aria-label="Minimum days" />
          to
          <Input type="number" min={1} max={120} value={days[1]} onChange={(e) => setDays([days[0], Number(e.target.value)])} className="h-9 w-20" aria-label="Maximum days" />
          days
        </label>
      </Card>
      {results !== null && <p className="text-xs text-gray-500">{live ? `Live results from ${source === "alibaba" ? "Alibaba.com" : "1688"} · page ${page}` : "Sample results (import service not connected)"}</p>}

      {results === null ? (
        <EmptyState icon={Search} title="Search the supplier catalogue" description="Find a product, check the supplier's price, then import it as a draft. Photos are copied to Alaba's storage." />
      ) : results.length === 0 ? (
        <EmptyState icon={Search} title={`No results for “${q}”`} description="Try a shorter or more general term, or switch catalogue." />
      ) : (
        <>
          <ul className="grid gap-3 md:grid-cols-2">
            {results.map((r) => {
              const id = r.externalId;
              const done = imported.get(id);
              const askWeight = needsWeight.has(id);
              const estPrice = Math.ceil((r.priceRmb[1] * pricingSettings.fxRate * (1 + pricingSettings.defaultMarkup)) / 50) * 50;
              return (
                <li key={id}>
                  <Card className="grid gap-3 p-4">
                    <div className="flex gap-3">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- supplier CDN thumbnail, preview only
                        <img src={r.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-20 shrink-0 rounded-lg bg-gray-100 object-cover" />
                      ) : (
                        <span className="grid size-20 shrink-0 place-items-center rounded-lg bg-gray-100"><ImageOff className="size-5 text-gray-400" aria-hidden /></span>
                      )}
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-medium">{r.title}</p>
                        <p className="flex items-center gap-1 text-sm text-gray-600">
                          <span className="truncate">{r.supplier || "Supplier"}</span>
                          {r.verified && <BadgeCheck className="size-4 shrink-0 text-brand-600" aria-label="Verified supplier" />}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge>¥{r.priceRmb[0]}{r.priceRmb[1] !== r.priceRmb[0] ? `–${r.priceRmb[1]}` : ""}</Badge>
                      <Badge>Supplier MOQ {r.moq}</Badge>
                      {r.rating > 0 && <Badge>★ {r.rating}</Badge>}
                      {r.orders > 0 && <Badge>{r.orders.toLocaleString()} sold</Badge>}
                      <Badge tone="info">≈ {formatNaira(estPrice * 100)} to customer</Badge>
                    </div>
                    {done ? (
                      <p className="flex items-center gap-1.5 text-sm font-medium text-green-700"><Check className="size-4" aria-hidden />{done}</p>
                    ) : (
                      <div className={cn("grid gap-2", askWeight ? "sm:grid-cols-[1fr_1fr_6rem_auto]" : "sm:grid-cols-[1fr_1fr_auto]")}>
                        <Input aria-label={`Brand for ${r.title}`} placeholder="Brand (required)" value={brand[id] ?? ""} onChange={(e) => setBrand((b) => ({ ...b, [id]: e.target.value }))} className="h-9 text-sm" />
                        <Select aria-label={`Category for ${r.title}`} value={cat[id] ?? ""} onChange={(e) => setCat((c) => ({ ...c, [id]: e.target.value }))} className="h-9 text-sm">
                          <option value="">Category…</option>
                          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                        </Select>
                        {askWeight && (
                          <Input aria-label="Shipping weight in kg" placeholder="kg" inputMode="decimal" value={weight[id] ?? ""} onChange={(e) => setWeight((w) => ({ ...w, [id]: e.target.value.replace(/[^\d.]/g, "") }))} className="h-9 border-orange-500 text-sm" autoFocus />
                        )}
                        <Button
                          size="sm"
                          className="h-9"
                          loading={busy === id}
                          loadingText="Importing…"
                          disabled={busy !== null && busy !== id}
                          onClick={() => {
                            if (!brand[id]?.trim()) return void toast.error("Enter a brand first (use Generic if unbranded)");
                            if (!cat[id]) return void toast.error("Choose a category first");
                            setBusy(id);
                            startImport(async () => {
                              const res = await importAsDraft({ externalId: id, category: cat[id]!, brand: brand[id]!, deliveryMin: days[0], deliveryMax: days[1], weightKg: Number(weight[id]) || undefined });
                              setBusy(null);
                              if (!res.ok) {
                                if (res.needsWeight) setNeedsWeight((s) => new Set(s).add(id));
                                return void toast.error(res.msg);
                              }
                              setImported((m) => new Map(m).set(id, `${res.updated ? "Updated" : "Imported"} as draft · ${res.variants} variant${res.variants === 1 ? "" : "s"} · ${res.images} photos`));
                              toast.success(res.updated ? "Draft updated" : "Imported as draft", { description: `“${res.product.name}” · ${days[0]}–${days[1]} days delivery. Review price and photos in Products before publishing.` });
                            });
                          }}
                        >
                          <Download className="size-4" aria-hidden /> Import
                        </Button>
                      </div>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
          {live && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || searching} onClick={() => search(page - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={searching || results.length < 10} onClick={() => search(page + 1)}>Next page</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
