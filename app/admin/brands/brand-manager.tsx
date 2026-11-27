"use client";

import { BadgeCheck, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/misc";
import type { Brand } from "@/lib/types";

type Row = Brand & { products: number };
type Pending = { ref: string; name: string; owner: string; trademark: string; role: string };

const slugify = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function BrandManager({ initial, pending: initialPending }: { initial: Row[]; pending: Pending[] }) {
  const [rows, setRows] = useState(initial);
  const [pending, setPending] = useState(initialPending);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [error, setError] = useState("");

  return (
    <div className="grid gap-6">
      {pending.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-3 font-semibold">Official brand applications</h2>
          <ul className="grid gap-3">
            {pending.map((p) => (
              <li key={p.ref} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 text-sm">
                <span><strong>{p.name}</strong> · {p.owner} · TM {p.trademark} · {p.role}<span className="block text-xs text-gray-500">{p.ref}</span></span>
                <span className="flex gap-2">
                  <Button size="sm" onClick={() => { setRows((r) => [{ slug: slugify(p.name), name: p.name, official: true, country: "Nigeria", description: `${p.name} official store.`, products: 0 }, ...r]); setPending((x) => x.filter((y) => y.ref !== p.ref)); toast.success(`${p.name} approved as an official brand`); }}>
                    <BadgeCheck className="size-4" aria-hidden />Approve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setPending((x) => x.filter((y) => y.ref !== p.ref)); toast("Application declined", { description: "The applicant is emailed the reason." }); }}>Decline</Button>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Card className="p-5">
        <form
          className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const slug = slugify(name);
            if (name.trim().length < 2) return setError("Enter a brand name");
            if (rows.some((r) => r.slug === slug)) return setError(`“${name}” already exists`);
            setRows((r) => [{ slug, name: name.trim(), official: false, country, description: "", products: 0 }, ...r]);
            setName("");
            setError("");
            toast.success(`Brand “${name.trim()}” added`);
          }}
        >
          <Field label="New brand" htmlFor="brand-name" error={error}>
            <Input id="brand-name" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} aria-invalid={!!error || undefined} />
          </Field>
          <Field label="Country" htmlFor="brand-country">
            <Input id="brand-country" value={country} onChange={(e) => setCountry(e.target.value)} />
          </Field>
          <Button type="submit" className="h-11"><Plus className="size-4" aria-hidden />Add brand</Button>
        </form>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="sr-only">Brands</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs tracking-wide text-gray-600 uppercase"><tr><th className="px-4 py-3">Brand</th><th className="px-4 py-3">Country</th><th className="px-4 py-3 text-right">Products</th><th className="px-4 py-3">Status</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((b) => (
              <tr key={b.slug}><td className="px-4 py-2.5 font-medium">{b.name}</td><td className="px-4 py-2.5">{b.country}</td><td className="px-4 py-2.5 text-right tabular-nums">{b.products}</td><td className="px-4 py-2.5">{b.official ? <Badge tone="info"><BadgeCheck className="size-3.5" aria-hidden />Official</Badge> : <Badge>Listed</Badge>}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
