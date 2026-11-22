"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { defaultAgent, pricingSettings } from "@/lib/data/settings";
import { estShippingKobo, markupFor, unitPriceKobo } from "@/lib/pricing";
import type { Category, Product } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

type Draft = {
  name: string; brand: string; category: string; source: "imported" | "local"; status: "active" | "draft";
  description: string; highlights: string; options: string;
  supplierRmb: string; priceNgn: string; compareNgn: string;
  kg: string; l: string; w: string; h: string; moq: string; stock: string; dmin: string; dmax: string;
  images: string[];
};

function fromProduct(p?: Product): Draft {
  return {
    name: p?.name ?? "", brand: p?.brand ?? "", category: p?.category ?? "", source: p?.source ?? "imported", status: p?.status === "draft" ? "draft" : "active",
    description: p?.description ?? "", highlights: p?.highlights.join("\n") ?? "", options: p?.options.map((o) => `${o.name}: ${o.values.join(", ")}`).join("\n") ?? "",
    supplierRmb: p?.supplierPriceFen ? String(p.supplierPriceFen / 100) : "", priceNgn: p?.priceKobo ? String(p.priceKobo / 100) : "", compareNgn: p?.compareAtKobo ? String(p.compareAtKobo / 100) : "",
    kg: p ? String(p.estWeightKg) : "", l: p ? String(p.dimsCm[0]) : "", w: p ? String(p.dimsCm[1]) : "", h: p ? String(p.dimsCm[2]) : "",
    moq: p ? String(p.moq) : "1", stock: p?.source === "local" ? String(p.stock) : "", dmin: p ? String(p.deliveryDays[0]) : "10", dmax: p ? String(p.deliveryDays[1]) : "18",
    images: p?.images ?? [],
  };
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const [d, setD] = useState<Draft>(() => fromProduct(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const set = (k: keyof Draft, v: string) => { setD((x) => ({ ...x, [k]: v })); setErrors(({ [k]: _x, ...r }) => r); };
  const num = (v: string) => Number(v) || 0;
  const imported = d.source === "imported";

  const preview = {
    source: d.source, category: d.category, supplierPriceFen: Math.round(num(d.supplierRmb) * 100), priceKobo: Math.round(num(d.priceNgn) * 100),
    estWeightKg: num(d.kg), dimsCm: [num(d.l), num(d.w), num(d.h)] as [number, number, number],
  };
  const price = unitPriceKobo(preview);
  const ship = preview.estWeightKg ? estShippingKobo(preview) : 0;
  const cost = imported ? preview.supplierPriceFen * pricingSettings.fxRate : 0;

  function save(status: "active" | "draft") {
    const e: Record<string, string> = {};
    if (d.name.trim().length < 4) e.name = "Add a clear product name";
    if (!d.category) e.category = "Choose a category";
    if (imported && !(num(d.supplierRmb) > 0)) e.supplierRmb = "Enter the supplier price in ¥";
    if (!imported && !(num(d.priceNgn) > 0)) e.priceNgn = "Enter the selling price in ₦";
    if (!(num(d.kg) > 0)) e.kg = "Enter an estimated weight";
    if (status === "active" && !d.images.length) e.images = "Add at least one image before publishing";
    if (num(d.dmin) > num(d.dmax)) e.dmax = "Max must be ≥ min";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error(`Fix ${Object.keys(e).length} field${Object.keys(e).length > 1 ? "s" : ""} to ${status === "active" ? "publish" : "save"}`);
      document.getElementById(Object.keys(e)[0]!)?.focus();
      return;
    }
    start(async () => {
      await new Promise((r) => setTimeout(r, 600));
      toast.success(status === "active" ? (product ? "Product updated" : "Product published") : "Saved as draft");
      router.push("/admin/products");
    });
  }

  const inv = (k: string) => ({ "aria-invalid": !!errors[k] || undefined });

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
      <div className="grid gap-6">
        <Card className="grid gap-4 p-5">
          <h2 className="font-semibold">Basics</h2>
          <Field label="Product name" htmlFor="name" error={errors.name}><Input id="name" value={d.name} onChange={(e) => set("name", e.target.value)} {...inv("name")} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Brand" htmlFor="brand" optional><Input id="brand" value={d.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
            <Field label="Category" htmlFor="category" error={errors.category}>
              <Select id="category" value={d.category} onChange={(e) => set("category", e.target.value)} {...inv("category")}>
                <option value="">Choose…</option>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Source" htmlFor="source">
              <Select id="source" value={d.source} onChange={(e) => { set("source", e.target.value); set("dmin", e.target.value === "local" ? "1" : "10"); set("dmax", e.target.value === "local" ? "3" : "18"); }}>
                <option value="imported">Imported (China)</option>
                <option value="local">Local stock</option>
              </Select>
            </Field>
          </div>
          <Field label="Description" htmlFor="description"><Textarea id="description" value={d.description} onChange={(e) => set("description", e.target.value)} /></Field>
          <Field label="Highlights" htmlFor="highlights" hint="One per line. Shown as bullet points."><Textarea id="highlights" value={d.highlights} onChange={(e) => set("highlights", e.target.value)} /></Field>
          <Field label="Variants" htmlFor="options" hint="One option per line, e.g. “Colour: Black, White”" optional><Textarea id="options" className="min-h-20" value={d.options} onChange={(e) => set("options", e.target.value)} /></Field>
        </Card>

        <Card className="grid gap-4 p-5">
          <h2 className="font-semibold">Images</h2>
          <ul className="flex flex-wrap gap-3">
            {d.images.map((src) => (
              <li key={src} className="relative">
                <Image src={src} alt="" width={96} height={96} className="size-24 rounded-lg border border-gray-200 bg-gray-100 object-cover" unoptimized={src.startsWith("blob:")} />
                <button type="button" onClick={() => setD((x) => ({ ...x, images: x.images.filter((i) => i !== src) }))} className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-navy-900 text-white" aria-label="Remove image"><X className="size-3.5" /></button>
              </li>
            ))}
            <li>
              <label className="grid size-24 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-navy-900 hover:text-navy-900">
                <span className="grid justify-items-center gap-1 text-xs"><ImagePlus className="size-5" aria-hidden />Add</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setD((x) => ({ ...x, images: [...x.images, ...files.map((f) => URL.createObjectURL(f))] }));
                  setErrors(({ images: _i, ...r }) => r);
                }} />
              </label>
            </li>
          </ul>
          {errors.images && <p id="images" role="alert" tabIndex={-1} className="text-sm text-red-600">{errors.images}</p>}
        </Card>

        <Card className="grid gap-4 p-5">
          <h2 className="font-semibold">Pricing, weight and delivery</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {imported ? (
              <Field label="Supplier price (¥)" htmlFor="supplierRmb" error={errors.supplierRmb} hint="Admin only. Never shown to customers."><Input id="supplierRmb" inputMode="decimal" value={d.supplierRmb} onChange={(e) => set("supplierRmb", e.target.value)} {...inv("supplierRmb")} /></Field>
            ) : (
              <Field label="Selling price (₦)" htmlFor="priceNgn" error={errors.priceNgn}><Input id="priceNgn" inputMode="numeric" value={d.priceNgn} onChange={(e) => set("priceNgn", e.target.value)} {...inv("priceNgn")} /></Field>
            )}
            <Field label="Compare-at price (₦)" htmlFor="compareNgn" optional><Input id="compareNgn" inputMode="numeric" value={d.compareNgn} onChange={(e) => set("compareNgn", e.target.value)} /></Field>
            <Field label="Minimum order" htmlFor="moq"><Input id="moq" inputMode="numeric" value={d.moq} onChange={(e) => set("moq", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Est. weight (kg)" htmlFor="kg" error={errors.kg}><Input id="kg" inputMode="decimal" value={d.kg} onChange={(e) => set("kg", e.target.value)} {...inv("kg")} /></Field>
            <Field label="Length (cm)" htmlFor="l"><Input id="l" inputMode="numeric" value={d.l} onChange={(e) => set("l", e.target.value)} /></Field>
            <Field label="Width (cm)" htmlFor="w"><Input id="w" inputMode="numeric" value={d.w} onChange={(e) => set("w", e.target.value)} /></Field>
            <Field label="Height (cm)" htmlFor="h"><Input id="h" inputMode="numeric" value={d.h} onChange={(e) => set("h", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {!imported && <Field label="Stock" htmlFor="stock"><Input id="stock" inputMode="numeric" value={d.stock} onChange={(e) => set("stock", e.target.value)} /></Field>}
            <Field label="Delivery min (days)" htmlFor="dmin"><Input id="dmin" inputMode="numeric" value={d.dmin} onChange={(e) => set("dmin", e.target.value)} /></Field>
            <Field label="Delivery max (days)" htmlFor="dmax" error={errors.dmax}><Input id="dmax" inputMode="numeric" value={d.dmax} onChange={(e) => set("dmax", e.target.value)} {...inv("dmax")} /></Field>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:sticky xl:top-6">
        <Card className="grid gap-3 p-5 text-sm">
          <h2 className="font-semibold">Customer sees</h2>
          <p className="text-3xl font-semibold tabular-nums">{formatNaira(price)}</p>
          {imported && <p className="text-gray-600">+ est. {formatNaira(ship)} shipping & customs</p>}
          <p className="text-gray-600">Arrives in {d.dmin}–{d.dmax} days</p>
          {imported && price > 0 && (
            <dl className="mt-2 grid gap-1.5 border-t border-gray-200 pt-3">
              <div className="flex justify-between"><dt className="text-gray-600">Cost at ₦{pricingSettings.fxRate}/¥</dt><dd className="tabular-nums">{formatNaira(cost)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Markup ({Math.round(markupFor(d.category) * 100)}%)</dt><dd className="tabular-nums">{formatNaira(price - cost)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-600">Freight rate</dt><dd>{formatNaira(defaultAgent.ratePerKgKobo)}/kg</dd></div>
            </dl>
          )}
          <p className="text-xs text-gray-500">Markup and FX come from Pricing rules, so prices update automatically when rates change.</p>
        </Card>
        <Button size="lg" loading={pending} onClick={() => save("active")}>{product ? "Save changes" : "Publish"}</Button>
        <Button variant="outline" onClick={() => save("draft")} disabled={pending}>Save as draft</Button>
      </div>
    </div>
  );
}
