"use client";

import { Download, Search, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/misc";
import { downloadCsv } from "@/lib/csv";
import { formatNaira, formatRmb } from "@/lib/utils";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  image: string;
  category: string;
  source: "imported" | "local";
  origin: "manual" | "alibaba";
  status: "active" | "draft" | "archived";
  availability: "in_stock" | "preorder" | "out_of_stock";
  stock: number | null;
  supplierFen: number | null;
  priceKobo: number;
  sold: number;
};

export function ProductsTable({ rows }: { rows: ProductRow[] }) {
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const t = q.toLowerCase();
    return rows.filter((r) => (!source || r.source === source) && (!status || r.status === status || r.availability === status) && (!t || r.name.toLowerCase().includes(t) || r.category.toLowerCase().includes(t)));
  }, [rows, q, source, status]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <Input aria-label="Search products" placeholder="Search name or category" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 pl-9" />
        </div>
        <Select aria-label="Source" value={source} onChange={(e) => setSource(e.target.value)} className="h-10 w-auto">
          <option value="">All sources</option><option value="imported">Imported</option><option value="local">Local</option>
        </Select>
        <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 w-auto">
          <option value="">Any status</option><option value="active">Active</option><option value="draft">Draft</option><option value="out_of_stock">Sold out</option><option value="preorder">Pre-order</option>
        </Select>
        <input
          ref={file}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const lines = (await f.text()).split(/\r?\n/).filter(Boolean);
            e.target.value = "";
            if (lines.length < 2) return toast.error("That file has no product rows", { description: "Export first to get the right column layout." });
            toast.success(`${lines.length - 1} rows read from ${f.name}`, { description: "In production these are validated, previewed, then saved as drafts." });
          }}
        />
        <Button variant="outline" className="h-10" onClick={() => file.current?.click()}><Upload className="size-4" aria-hidden /> Import CSV</Button>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            downloadCsv("shupzy-products.csv", list.map((r) => ({ id: r.id, name: r.name, category: r.category, source: r.source, status: r.status, availability: r.availability, stock: r.stock ?? "", supplier_price_rmb: r.supplierFen ? r.supplierFen / 100 : "", price_ngn: r.priceKobo / 100 })));
            toast.success(`Exported ${list.length} products`);
          }}
        >
          <Download className="size-4" aria-hidden /> Export
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <caption className="sr-only">Products</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs tracking-wide text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Cost</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Sold</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/70">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${r.id}`} className="flex items-center gap-3">
                    <Image src={r.image} alt="" width={40} height={40} className="size-10 rounded-md bg-gray-100" />
                    <span>
                      <span className="line-clamp-1 font-medium hover:underline">{r.name}</span>
                      <span className="text-xs text-gray-500">{r.category}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={r.source === "imported" ? "info" : "orange"}>{r.source === "imported" ? "Imported" : "Local"}</Badge>
                  {r.origin === "alibaba" && <span className="ml-1 text-xs text-gray-500">via Alibaba</span>}
                </td>
                <td className="px-4 py-3">
                  {r.availability === "out_of_stock" ? <Badge tone="bad">Sold out</Badge> : r.availability === "preorder" ? <Badge tone="navy">Pre-order</Badge> : <Badge tone="good">Active</Badge>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-600">{r.supplierFen ? formatRmb(r.supplierFen) : "—"}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">{formatNaira(r.priceKobo)}</td>
                <td className={`px-4 py-3 text-right tabular-nums ${r.stock !== null && r.stock < 10 ? "font-medium text-orange-600" : ""}`}>{r.stock ?? "On order"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.sold.toLocaleString()}</td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No products match.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
