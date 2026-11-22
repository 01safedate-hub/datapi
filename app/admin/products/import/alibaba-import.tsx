"use client";

import { Check, Download, Search } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Badge, Card, EmptyState } from "@/components/ui/misc";
import { pricingSettings } from "@/lib/data/settings";
import { formatNaira } from "@/lib/utils";

type Result = { id: string; title: string; supplier: string; priceRmb: [number, number]; moq: number; rating: number; orders: number };

const sample: Result[] = [
  { id: "1600987711", title: "Wireless Earbuds ENC Bluetooth 5.4, 40h Playtime", supplier: "Shenzhen Soundwave Tech Co.", priceRmb: [38, 52], moq: 10, rating: 4.8, orders: 3120 },
  { id: "1600954402", title: "Portable Mini Projector 1080P WiFi Android 11", supplier: "Guangzhou Beam Optics Ltd.", priceRmb: [310, 360], moq: 2, rating: 4.6, orders: 980 },
  { id: "1601002371", title: "20000mAh Power Bank 22.5W PD Fast Charge LED Display", supplier: "Dongguan Volt Energy", priceRmb: [42, 49], moq: 20, rating: 4.7, orders: 5400 },
  { id: "1600931140", title: "Men's Breathable Running Shoes Lightweight Knit", supplier: "Jinjiang Stride Footwear", priceRmb: [68, 85], moq: 6, rating: 4.5, orders: 2210 },
  { id: "1600899123", title: "Smart Watch 1.96\" AMOLED Bluetooth Call IP68", supplier: "Shenzhen Fitly Wearables", priceRmb: [92, 118], moq: 5, rating: 4.6, orders: 4300 },
  { id: "1600877650", title: "6L Digital Air Fryer Oil-Free 1700W", supplier: "Ningbo HomeChef Appliances", priceRmb: [148, 172], moq: 4, rating: 4.4, orders: 760 },
];

export function AlibabaImport({ categories }: { categories: { slug: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [cat, setCat] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-5">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            await new Promise((r) => setTimeout(r, 700));
            const t = q.toLowerCase().split(" ").filter(Boolean);
            setResults(t.length ? sample.filter((r) => t.some((w) => r.title.toLowerCase().includes(w))) : sample);
          });
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <Input aria-label="Search Alibaba" placeholder="e.g. earbuds, power bank, shoes (leave empty for trending)" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Button type="submit" loading={pending} loadingText="Searching…">Search</Button>
      </form>

      {results === null ? (
        <EmptyState icon={Search} title="Search the supplier catalogue" description="Find a product, check the supplier's price and minimum order, then import it as a draft." />
      ) : results.length === 0 ? (
        <EmptyState icon={Search} title={`No results for “${q}”`} description="Try a shorter or more general term." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {results.map((r) => {
            const done = imported.has(r.id);
            const estPrice = Math.ceil((r.priceRmb[0] * pricingSettings.fxRate * (1 + pricingSettings.defaultMarkup)) / 50) * 50;
            return (
              <li key={r.id}>
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
                  </div>
                  <div className="flex gap-2">
                    <Select aria-label={`Category for ${r.title}`} value={cat[r.id] ?? ""} onChange={(e) => setCat((c) => ({ ...c, [r.id]: e.target.value }))} className="h-9 text-sm" disabled={done}>
                      <option value="">Category…</option>
                      {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </Select>
                    <Button
                      size="sm"
                      variant={done ? "ghost" : "primary"}
                      className="h-9"
                      disabled={done}
                      onClick={() => {
                        if (!cat[r.id]) return toast.error("Choose a category first");
                        setImported((s) => new Set(s).add(r.id));
                        toast.success("Imported as draft", { description: "Add the weight and review the price in Products before publishing." });
                      }}
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
