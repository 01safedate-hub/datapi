"use client";

import { Loader2, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Select } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import type { SortKey } from "@/lib/catalog";
import { cn } from "@/lib/utils";

type Props = {
  total: number;
  sortOptions: { value: SortKey; label: string }[];
  categories?: { slug: string; name: string }[];
};

const priceRanges = [
  { label: "Under ₦20,000", min: "", max: "20000" },
  { label: "₦20,000 – ₦100,000", min: "20000", max: "100000" },
  { label: "₦100,000 – ₦500,000", min: "100000", max: "500000" },
  { label: "Over ₦500,000", min: "500000", max: "" },
];

export function useListingParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  function set(updates: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    start(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  }
  return { params, set, pending, pathname, router };
}

function PriceInputs({ min, max, onApply }: { min: string; max: string; onApply: (min: string, max: string) => void }) {
  const [minDraft, setMinDraft] = useState(min);
  const [maxDraft, setMaxDraft] = useState(max);
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(minDraft, maxDraft);
      }}
    >
      <Input aria-label="Minimum price in naira" inputMode="numeric" placeholder="Min ₦" value={minDraft} onChange={(e) => setMinDraft(e.target.value.replace(/\D/g, ""))} className="h-9 text-sm" />
      <span className="text-gray-400">–</span>
      <Input aria-label="Maximum price in naira" inputMode="numeric" placeholder="Max ₦" value={maxDraft} onChange={(e) => setMaxDraft(e.target.value.replace(/\D/g, ""))} className="h-9 text-sm" />
      <Button type="submit" size="sm" variant="outline">Go</Button>
    </form>
  );
}

function FilterFields({ categories }: { categories?: Props["categories"] }) {
  const { params, set } = useListingParams();
  const group = useId();
  const source = params.get("source") ?? "";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";

  return (
    <div className="grid gap-7">
      {categories && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">Category</legend>
          <ul className="grid gap-1 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="block rounded-md py-1 text-gray-700 hover:text-brand-600">{c.name}</Link>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Seller</legend>
        <div className="grid gap-1.5 text-sm">
          {[
            { v: "", l: "All sellers" },
            { v: "manufacturer", l: "Manufacturers" },
            { v: "vendor", l: "Vendors & retailers" },
          ].map((o) => (
            <label key={o.v} className="flex cursor-pointer items-center gap-2.5 py-1">
              <input type="radio" name={`${group}-seller`} className="size-4 accent-navy-900" checked={(params.get("seller") ?? "") === o.v} onChange={() => set({ seller: o.v || null })} />
              {o.l}
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-2.5 py-1">
            <Checkbox checked={params.get("verified") === "1"} onChange={(e) => set({ verified: e.target.checked ? "1" : null })} />
            Verified sellers only
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 py-1">
            <Checkbox checked={params.get("wholesale") === "1"} onChange={(e) => set({ wholesale: e.target.checked ? "1" : null })} />
            Wholesale prices available
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Ships from</legend>
        <div className="grid gap-1.5 text-sm">
          {[
            { v: "", l: "Everywhere" },
            { v: "imported", l: "Imported by Alaba (10–18 days)" },
            { v: "local", l: "Within Nigeria (1–7 days)" },
          ].map((o) => (
            <label key={o.v} className="flex cursor-pointer items-center gap-2.5 py-1">
              <input type="radio" name={`${group}-source`} className="size-4 accent-navy-900" checked={source === o.v} onChange={() => set({ source: o.v || null })} />
              {o.l}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Price</legend>
        <div className="mb-3 grid gap-1.5 text-sm">
          {priceRanges.map((r) => {
            const on = min === r.min && max === r.max;
            return (
              <button
                key={r.label}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  set(on ? { min: null, max: null } : { min: r.min || null, max: r.max || null });
                }}
                className={cn("rounded-md py-1 text-left hover:text-brand-600", on && "font-semibold text-navy-900")}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <PriceInputs key={`${min}-${max}`} min={min} max={max} onApply={(a, b) => set({ min: a || null, max: b || null })} />
      </fieldset>

      <fieldset className="grid gap-2 text-sm">
        <legend className="mb-2 text-sm font-semibold">Availability</legend>
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox checked={params.get("stock") === "1"} onChange={(e) => set({ stock: e.target.checked ? "1" : null })} />
          Hide sold-out items
        </label>
        <label className="flex cursor-pointer items-center gap-2.5">
          <Checkbox checked={params.get("fast") === "1"} onChange={(e) => set({ fast: e.target.checked ? "1" : null })} />
          Delivered within 4 days
        </label>
      </fieldset>
    </div>
  );
}

const labels: Record<string, (v: string) => string> = {
  source: (v) => (v === "local" ? "Within Nigeria" : "Imported"),
  seller: (v) => (v === "manufacturer" ? "Manufacturers" : "Vendors"),
  verified: () => "Verified sellers",
  wholesale: () => "Wholesale",
  min: (v) => `From ₦${Number(v).toLocaleString()}`,
  max: (v) => `Up to ₦${Number(v).toLocaleString()}`,
  stock: () => "In stock",
  fast: () => "Within 4 days",
};

export function ListingToolbar({ total, sortOptions, categories }: Props) {
  const { params, set, pending } = useListingParams();
  const [open, setOpen] = useState(false);
  const active = Object.keys(labels).filter((k) => params.get(k));

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters{active.length ? ` (${active.length})` : ""}
        </Button>
        <p className="flex items-center gap-2 text-sm text-gray-600" aria-live="polite">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {total.toLocaleString()} {total === 1 ? "product" : "products"}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="sort" className="hidden text-sm text-gray-600 sm:block">Sort by</label>
          <Select id="sort" value={params.get("sort") ?? (params.get("q") ? "" : "popular")} onChange={(e) => set({ sort: e.target.value || null })} className="h-9 w-auto text-sm">
            {params.get("q") && <option value="">Best match</option>}
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </div>
      </div>
      {active.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {active.map((k) => (
            <button key={k} type="button" onClick={() => set({ [k]: null })} className="inline-flex items-center gap-1 rounded-full bg-navy-900 py-1 pr-2 pl-3 text-xs font-medium text-white">
              {labels[k]!(params.get(k)!)}
              <X className="size-3.5" aria-label="Remove filter" />
            </button>
          ))}
          <button type="button" onClick={() => set({ source: null, min: null, max: null, stock: null, fast: null, seller: null, verified: null, wholesale: null })} className="text-xs font-medium text-brand-600 hover:underline">
            Clear all
          </button>
        </div>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="Filters" side="bottom" footer={<Button className="w-full" onClick={() => setOpen(false)}>Show {total} products</Button>}>
        <FilterFields categories={categories} />
      </Sheet>
    </>
  );
}

export function FilterSidebar({ categories }: { categories?: Props["categories"] }) {
  return (
    <aside className="hidden lg:block" aria-label="Filters">
      <FilterFields categories={categories} />
    </aside>
  );
}
