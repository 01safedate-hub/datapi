"use client";

import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { parseVideoLink, videoLinkHelp } from "@/lib/video";
import { createListing, type ListingInput } from "../actions";

type Opt = { slug: string; name: string };
type V = { label: string; price: string; stock: string };

export function ListingForm({ brands, categories, remaining }: { brands: Opt[]; categories: Opt[]; remaining: number | null }) {
  const [f, setF] = useState({ name: "", brand: "", category: "", description: "", optionName: "", moq: "1", weightKg: "", freeDelivery: false, videoUrl: "", condition: "new" as ListingInput["condition"], warranty: "" });
  const [variants, setVariants] = useState<V[]>([{ label: "", price: "", stock: "" }]);
  const [specs, setSpecs] = useState([{ key: "", value: "" }]);
  const [tiers, setTiers] = useState<{ minQty: string; pct: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _y, ...r }) => r);
  };
  const inv = (k: string) => ({ "aria-invalid": !!errors[k] || undefined });
  const video = f.videoUrl.trim() ? parseVideoLink(f.videoUrl) : null;
  const videoErr = f.videoUrl.trim() && !video ? videoLinkHelp : errors.videoUrl;

  if (done) {
    return (
      <Card className="grid justify-items-center gap-3 p-8 text-center">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden />
        <h2 className="text-xl font-semibold">Product submitted</h2>
        <p className="text-gray-600">It goes live after a quick quality check, usually within 2 hours.{remaining != null && ` ${remaining - 1} listings left on your plan.`}</p>
        <div className="flex gap-3"><ButtonLink href="/seller/products" variant="outline">Back to products</ButtonLink><Button onClick={() => location.reload()}>Add another</Button></div>
      </Card>
    );
  }

  return (
    <form
      ref={ref}
      noValidate
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (videoErr) return void toast.error("Fix the video link or leave it empty");
        start(async () => {
          const res = await createListing({
            ...f,
            moq: Number(f.moq) || 1,
            weightKg: Number(f.weightKg) || 0,
            variants: variants.map((v) => ({ label: v.label, priceNaira: Number(v.price) || 0, stock: Number(v.stock) || 0 })),
            specs: specs.filter((s) => s.key && s.value),
            wholesale: tiers.filter((t) => t.minQty && t.pct).map((t) => ({ minQty: Number(t.minQty), discountPct: Number(t.pct) })),
          });
          if (!res.ok) {
            setErrors(res.fieldErrors ?? {});
            toast.error(res.message);
            requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
            return;
          }
          setDone(res.slug);
          toast.success("Product submitted for review");
        });
      }}
    >
      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Basics</h2>
        <Field label="Product name" htmlFor="name" error={errors.name} className="sm:col-span-2">
          <Input id="name" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Handmade Leather Loafers, Brown" {...inv("name")} />
        </Field>
        <Field label="Brand" htmlFor="brand" error={errors.brand} hint={<>Not listed? <Link href="/brands/register" className="text-brand-600 hover:underline">Register a brand</Link> or choose Unbranded.</>}>
          <Select id="brand" value={f.brand} onChange={(e) => set("brand", e.target.value)} {...inv("brand")}>
            <option value="">Choose brand</option>
            <option value="unbranded">Unbranded / generic</option>
            {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </Select>
        </Field>
        <Field label="Category" htmlFor="category" error={errors.category}>
          <Select id="category" value={f.category} onChange={(e) => set("category", e.target.value)} {...inv("category")}>
            <option value="">Choose category</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Condition" htmlFor="condition">
          <Select id="condition" value={f.condition} onChange={(e) => set("condition", e.target.value as ListingInput["condition"])}>
            <option value="new">Brand new</option><option value="refurbished">Refurbished</option><option value="used">Used</option>
          </Select>
        </Field>
        <Field label="Warranty" htmlFor="warranty" optional>
          <Input id="warranty" value={f.warranty} onChange={(e) => set("warranty", e.target.value)} placeholder="e.g. 6-month seller warranty" />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description} className="sm:col-span-2">
          <Textarea id="description" value={f.description} onChange={(e) => set("description", e.target.value)} {...inv("description")} />
        </Field>
      </Card>

      <Card className="grid gap-4 p-5">
        <div>
          <h2 className="font-semibold">Variants &amp; prices</h2>
          <p className="text-sm text-gray-600">Each variant can have its own price and stock.</p>
        </div>
        {variants.length > 1 && (
          <Field label="Variants differ by" htmlFor="optionName" error={errors.optionName} className="max-w-xs">
            <Input id="optionName" value={f.optionName} onChange={(e) => set("optionName", e.target.value)} placeholder="Size, Colour…" {...inv("optionName")} />
          </Field>
        )}
        {errors.variants && <p role="alert" className="text-sm text-red-600">{errors.variants}</p>}
        <ul className="grid gap-2">
          {variants.map((v, i) => (
            <li key={i} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)_auto] items-end gap-2">
              <Field label={i === 0 ? "Variant" : ""} htmlFor={`v-l-${i}`}>
                <Input id={`v-l-${i}`} value={v.label} onChange={(e) => setVariants((x) => x.map((y, j) => (j === i ? { ...y, label: e.target.value } : y)))} placeholder={variants.length > 1 ? "e.g. 42" : "Default"} aria-label={`Variant ${i + 1} name`} />
              </Field>
              <Field label={i === 0 ? "Price (₦)" : ""} htmlFor={`v-p-${i}`} error={errors[`variants.${i}.priceNaira`]}>
                <Input id={`v-p-${i}`} inputMode="numeric" value={v.price} onChange={(e) => setVariants((x) => x.map((y, j) => (j === i ? { ...y, price: e.target.value.replace(/\D/g, "") } : y)))} aria-label={`Variant ${i + 1} price`} aria-invalid={!!errors[`variants.${i}.priceNaira`] || undefined} />
              </Field>
              <Field label={i === 0 ? "Stock" : ""} htmlFor={`v-s-${i}`}>
                <Input id={`v-s-${i}`} inputMode="numeric" value={v.stock} onChange={(e) => setVariants((x) => x.map((y, j) => (j === i ? { ...y, stock: e.target.value.replace(/\D/g, "") } : y)))} aria-label={`Variant ${i + 1} stock`} />
              </Field>
              <Button variant="ghost" className="h-11 px-2" disabled={variants.length === 1} onClick={() => setVariants((x) => x.filter((_, j) => j !== i))} aria-label={`Remove variant ${i + 1}`}><Trash2 className="size-4" /></Button>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="w-fit" onClick={() => setVariants((x) => [...x, { label: "", price: x.at(-1)?.price ?? "", stock: "" }])}><Plus className="size-4" aria-hidden />Add variant</Button>
      </Card>

      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">Wholesale &amp; delivery</h2>
        <Field label="Minimum order" htmlFor="moq"><Input id="moq" inputMode="numeric" value={f.moq} onChange={(e) => set("moq", e.target.value.replace(/\D/g, ""))} /></Field>
        <Field label="Packed weight (kg)" htmlFor="weightKg" error={errors.weightKg} hint="Used to price GIG and Jumia delivery">
          <Input id="weightKg" inputMode="decimal" value={f.weightKg} onChange={(e) => set("weightKg", e.target.value.replace(/[^\d.]/g, ""))} {...inv("weightKg")} />
        </Field>
        <div className="grid gap-2 sm:col-span-2">
          <span className="text-sm font-medium">Bulk discounts <span className="font-normal text-gray-500">(optional)</span></span>
          {tiers.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Input aria-label="Minimum quantity" inputMode="numeric" value={t.minQty} onChange={(e) => setTiers((x) => x.map((y, j) => (j === i ? { ...y, minQty: e.target.value.replace(/\D/g, "") } : y)))} className="h-9 w-24" placeholder="10" />
              <span>+ pcs get</span>
              <Input aria-label="Discount percent" inputMode="numeric" value={t.pct} onChange={(e) => setTiers((x) => x.map((y, j) => (j === i ? { ...y, pct: e.target.value.replace(/\D/g, "") } : y)))} className="h-9 w-20" placeholder="5" />
              <span>% off</span>
              <Button variant="ghost" size="sm" onClick={() => setTiers((x) => x.filter((_, j) => j !== i))} aria-label="Remove tier"><Trash2 className="size-4" /></Button>
            </div>
          ))}
          {tiers.length < 5 && <Button variant="outline" size="sm" className="w-fit" onClick={() => setTiers((x) => [...x, { minQty: "", pct: "" }])}><Plus className="size-4" aria-hidden />Add tier</Button>}
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm sm:col-span-2">
          <Checkbox className="mt-0.5" checked={f.freeDelivery} onChange={(e) => set("freeDelivery", e.target.checked)} />
          <span><span className="font-medium">Offer free delivery</span><span className="block text-gray-600">You cover GIG/Jumia delivery. Include it in your price; buyers see “Free delivery”.</span></span>
        </label>
      </Card>

      <Card className="grid gap-4 p-5">
        <h2 className="font-semibold">Specifications &amp; video</h2>
        <ul className="grid gap-2">
          {specs.map((s, i) => (
            <li key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-2">
              <Input aria-label={`Spec ${i + 1} name`} placeholder="e.g. Material" value={s.key} onChange={(e) => setSpecs((x) => x.map((y, j) => (j === i ? { ...y, key: e.target.value } : y)))} />
              <Input aria-label={`Spec ${i + 1} value`} placeholder="e.g. Full-grain leather" value={s.value} onChange={(e) => setSpecs((x) => x.map((y, j) => (j === i ? { ...y, value: e.target.value } : y)))} />
              <Button variant="ghost" className="px-2" disabled={specs.length === 1} onClick={() => setSpecs((x) => x.filter((_, j) => j !== i))} aria-label={`Remove spec ${i + 1}`}><Trash2 className="size-4" /></Button>
            </li>
          ))}
        </ul>
        <Button variant="outline" size="sm" className="w-fit" onClick={() => setSpecs((x) => [...x, { key: "", value: "" }])}><Plus className="size-4" aria-hidden />Add spec</Button>
        <Field label="Product video (TikTok or Instagram)" htmlFor="videoUrl" optional error={videoErr || undefined} hint={video ? `✓ ${video.platform === "tiktok" ? "TikTok" : "Instagram"} link` : "Shown on your product page only if provided. Other sites aren't allowed."}>
          <Input id="videoUrl" type="url" inputMode="url" value={f.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://www.tiktok.com/@yourshop/video/…" aria-invalid={!!videoErr || undefined} />
        </Field>
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        <ButtonLink href="/seller/products" variant="ghost">Cancel</ButtonLink>
        <Button type="submit" variant="accent" loading={pending} loadingText="Submitting…">Submit for review</Button>
      </div>
    </form>
  );
}
