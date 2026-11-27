"use client";

import { Check, Download, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Badge, Card, EmptyState } from "@/components/ui/misc";
import { pricingSettings } from "@/lib/data/settings";
import type { ImportCandidate } from "@/lib/tmpi";
import { formatNaira } from "@/lib/utils";
import { importAsDraft, searchImports } from "./actions";

type Result = ImportCandidate;

export function ChinaImport({ categories, defaultDays }: { categories: { slug: string; name: string }[]; defaultDays: [number, number] }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [cat, setCat] = useState<Record<string, string>>({});
  const [brand, setBrand] = useState<Record<string, string>>({});
  const [days, setDays] = useState<[number, number]>(defaultDays);
  const [live, setLive] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-5">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const res = await searchImports(q);
            if (!res.ok) return void toast.error(res.message);
            setResults(res.results);
            setLive(res.live);
          });
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <Input aria-label="Search TMPI catalogue" placeholder="e.g. earbuds, power bank, shoes (leave empty for trending)" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit" loading={pending} loadingText="Searching…">Search</Button>
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
      {results !== null && <p className="text-xs text-gray-500">{live ? "Live TMPI results" : "Sample results (TMPI key not set)"}</p>}

      {results === null ? (
        <EmptyState icon={Search} title="Search the supplier catalogue" description="Find a product, check the supplier's price and minimum order, then import it as a draft." />
      ) : results.length === 0 ? (
        <EmptyState icon={Search} title={`No results for “${q}”`} description="Try a shorter or more general term." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {results.map((r) => {
            const id = r.externalId;
            const done = imported.has(id);
            const estPrice = Math.ceil((r.priceRmb[0] * pricingSettings.fxRate * (1 + pricingSettings.defaultMarkup)) / 50) * 50;
            return (
              <li key={id}>
                <Card className="grid gap-3 p-4">
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm text-gray-600">{r.supplier}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge>¥{r.priceRmb[0]}–{r.priceRmb[1]}</Badge>
                    <Badge>MOQ {r.moq}</Badge>
                    <Badge>★ {r.rating}</Badge>
                    <Badge>{r.orders.toLocaleString()} orders</Badge>
                    <Badge tone="info">≈ {formatNaira(estPrice * 100)} to customer</Badge>
                    <Badge tone="orange">Imported</Badge>
                    {r.variants.length > 1 && <Badge>{r.variants.length} variants</Badge>}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <Input aria-label={`Brand for ${r.title}`} placeholder="Brand (required)" value={brand[id] ?? ""} onChange={(e) => setBrand((b) => ({ ...b, [id]: e.target.value }))} className="h-9 text-sm" disabled={done} />
                    <Select aria-label={`Category for ${r.title}`} value={cat[id] ?? ""} onChange={(e) => setCat((c) => ({ ...c, [id]: e.target.value }))} className="h-9 text-sm" disabled={done}>
                      <option value="">Category…</option>
                      {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </Select>
                    <Button
                      size="sm"
                      variant={done ? "ghost" : "primary"}
                      className="h-9"
                      disabled={done}
                      onClick={() =>
                        start(async () => {
                          const res = await importAsDraft({ externalId: id, category: cat[id] ?? "", brand: brand[id] ?? "", deliveryMin: days[0], deliveryMax: days[1] });
                          if (!res.ok) return void toast.error(res.message);
                          setImported((s) => new Set(s).add(id));
                          toast.success("Imported as draft", { description: `Tagged Imported · ${days[0]}–${days[1]} days delivery. Review weight and price in Products before publishing.` });
                        })
                      }
                    >
                      {done ? <><Check className="size-4" aria-hidden /> Imported</> : <><Download className="size-4" aria-hidden /> Import</>}
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
