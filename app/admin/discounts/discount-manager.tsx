"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/sheet";
import type { Discount } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

export function DiscountManager({ initial }: { initial: Discount[] }) {
  const [list, setList] = useState(initial);
  const [open, setOpen] = useState(false);
  const [d, setD] = useState({ code: "", type: "percent" as Discount["type"], value: "", min: "", limit: "", expires: "", first: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function create() {
    const e: Record<string, string> = {};
    const code = d.code.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,20}$/.test(code)) e.code = "4–20 letters or numbers, no spaces";
    if (list.some((x) => x.code === code)) e.code = "That code already exists";
    const v = Number(d.value);
    if (!(v > 0) || (d.type === "percent" && v > 90)) e.value = d.type === "percent" ? "Between 1 and 90" : "Enter an amount";
    setErrors(e);
    if (Object.keys(e).length) return;
    setList((l) => [{ code, type: d.type, value: d.type === "percent" ? v : v * 100, minSpendKobo: Number(d.min || 0) * 100, firstOrderOnly: d.first, usageLimit: d.limit ? Number(d.limit) : null, used: 0, expiresAt: d.expires || null, active: true }, ...l]);
    setOpen(false);
    setD({ code: "", type: "percent", value: "", min: "", limit: "", expires: "", first: false });
    toast.success(`${code} is live`);
  }

  return (
    <>
      <div className="mb-4 flex justify-end"><Button onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden /> New code</Button></div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <caption className="sr-only">Discount codes</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs tracking-wide text-gray-600 uppercase">
            <tr><th className="px-4 py-3 font-medium">Code</th><th className="px-4 py-3 font-medium">Value</th><th className="px-4 py-3 font-medium">Rules</th><th className="px-4 py-3 text-right font-medium">Used</th><th className="px-4 py-3 font-medium">Expires</th><th className="px-4 py-3 font-medium">Active</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.map((x) => (
              <tr key={x.code}>
                <td className="px-4 py-3 font-mono font-medium">{x.code}</td>
                <td className="px-4 py-3">{x.type === "percent" ? `${x.value}% off` : `${formatNaira(x.value)} off`}</td>
                <td className="px-4 py-3 text-gray-600">{[x.minSpendKobo ? `Min ${formatNaira(x.minSpendKobo)}` : "No minimum", x.firstOrderOnly ? "First order" : null].filter(Boolean).join(" · ")}</td>
                <td className="px-4 py-3 text-right tabular-nums">{x.used}{x.usageLimit ? ` / ${x.usageLimit}` : ""}</td>
                <td className="px-4 py-3">{x.expiresAt ?? "Never"}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2">
                    <Checkbox checked={x.active} onChange={(e) => { setList((l) => l.map((y) => (y.code === x.code ? { ...y, active: e.target.checked } : y))); toast.success(`${x.code} ${e.target.checked ? "enabled" : "paused"}`); }} aria-label={`${x.code} active`} />
                    {x.active ? <Badge tone="good">On</Badge> : <Badge>Off</Badge>}
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Sheet open={open} onClose={() => setOpen(false)} title="New discount code" footer={<Button className="w-full" onClick={create}>Create code</Button>}>
        <div className="grid gap-4">
          <Field label="Code" htmlFor="d-code" error={errors.code}><Input id="d-code" className="uppercase" value={d.code} onChange={(e) => setD({ ...d, code: e.target.value })} aria-invalid={!!errors.code || undefined} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type" htmlFor="d-type"><Select id="d-type" value={d.type} onChange={(e) => setD({ ...d, type: e.target.value as Discount["type"] })}><option value="percent">Percentage</option><option value="fixed">Fixed ₦</option></Select></Field>
            <Field label={d.type === "percent" ? "Percent off" : "Naira off"} htmlFor="d-value" error={errors.value}><Input id="d-value" inputMode="numeric" value={d.value} onChange={(e) => setD({ ...d, value: e.target.value })} aria-invalid={!!errors.value || undefined} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Minimum spend (₦)" htmlFor="d-min" optional><Input id="d-min" inputMode="numeric" value={d.min} onChange={(e) => setD({ ...d, min: e.target.value })} /></Field>
            <Field label="Usage limit" htmlFor="d-limit" optional><Input id="d-limit" inputMode="numeric" value={d.limit} onChange={(e) => setD({ ...d, limit: e.target.value })} /></Field>
          </div>
          <Field label="Expires" htmlFor="d-exp" optional><Input id="d-exp" type="date" value={d.expires} onChange={(e) => setD({ ...d, expires: e.target.value })} /></Field>
          <label className="flex items-center gap-2.5 text-sm"><Checkbox checked={d.first} onChange={(e) => setD({ ...d, first: e.target.checked })} /> First order only</label>
        </div>
      </Sheet>
    </>
  );
}
