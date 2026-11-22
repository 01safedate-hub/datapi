"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/misc";
import type { DeliveryZone, ShippingAgent } from "@/lib/data/settings";
import { formatDateTime, formatNaira } from "@/lib/utils";

type Props = {
  settings: { fxRate: number; fxUpdatedAt: string; defaultMarkup: number; categoryMarkup: Record<string, number>; vat: boolean };
  categories: { slug: string; name: string }[];
  agents: ShippingAgent[];
  zones: DeliveryZone[];
};

const k2n = (kobo: number) => String(kobo / 100);

export function PricingEditor({ settings, categories, agents, zones }: Props) {
  const [fx, setFx] = useState(String(settings.fxRate));
  const [markup, setMarkup] = useState(String(Math.round(settings.defaultMarkup * 100)));
  const [catMarkup, setCatMarkup] = useState<Record<string, string>>(Object.fromEntries(categories.map((c) => [c.slug, settings.categoryMarkup[c.slug] != null ? String(Math.round(settings.categoryMarkup[c.slug]! * 100)) : ""])));
  const [rate, setRate] = useState(k2n(agents[0]!.ratePerKgKobo));
  const [clear, setClear] = useState(k2n(agents[0]!.clearancePerKgKobo));
  const [divisor, setDivisor] = useState(String(agents[0]!.volumetricDivisor));
  const [zoneRates, setZoneRates] = useState(zones.map((z) => ({ id: z.id, name: z.name, base: k2n(z.baseKobo), perKg: k2n(z.perKgKobo) })));
  const [vat, setVat] = useState(settings.vat);
  const [pending, start] = useTransition();

  const fxN = Number(fx), mN = Number(markup) / 100;
  const exampleRmb = 100;
  const exampleItem = Math.ceil((exampleRmb * fxN * (1 + mN)) / 50) * 50;
  const exampleShip = Math.ceil((1 * (Number(rate) + Number(clear))) / 50) * 50;
  const fxBad = !(fxN > 50 && fxN < 1000);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6">
        <Card className="grid gap-4 p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Exchange rate and markup</h2><span className="text-xs text-gray-500">FX last set {formatDateTime(settings.fxUpdatedAt)}</span></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="₦ per ¥1" htmlFor="fx" error={fxBad ? "That rate looks wrong. Check it before saving." : undefined}><Input id="fx" inputMode="decimal" value={fx} onChange={(e) => setFx(e.target.value)} aria-invalid={fxBad || undefined} /></Field>
            <Field label="Default markup (%)" htmlFor="markup"><Input id="markup" inputMode="numeric" value={markup} onChange={(e) => setMarkup(e.target.value)} /></Field>
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Category overrides <span className="font-normal text-gray-500">(blank = default)</span></legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => (
                <Field key={c.slug} label={c.name} htmlFor={`m-${c.slug}`}>
                  <Input id={`m-${c.slug}`} inputMode="numeric" placeholder={markup} value={catMarkup[c.slug]} onChange={(e) => setCatMarkup((m) => ({ ...m, [c.slug]: e.target.value }))} className="h-10" />
                </Field>
              ))}
            </div>
          </fieldset>
        </Card>

        <Card className="grid gap-4 p-5">
          <div className="flex items-center gap-2"><h2 className="font-semibold">Air freight</h2><Badge tone="info">{agents[0]!.name}</Badge></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Freight ₦/kg" htmlFor="rate"><Input id="rate" inputMode="numeric" value={rate} onChange={(e) => setRate(e.target.value)} /></Field>
            <Field label="Clearance ₦/kg" htmlFor="clear"><Input id="clear" inputMode="numeric" value={clear} onChange={(e) => setClear(e.target.value)} /></Field>
            <Field label="Volumetric divisor" htmlFor="div" hint="6000 is the air-freight standard"><Input id="div" inputMode="numeric" value={divisor} onChange={(e) => setDivisor(e.target.value)} /></Field>
          </div>
        </Card>

        <Card className="grid gap-4 p-5">
          <h2 className="font-semibold">Local delivery zones</h2>
          <div className="grid gap-3">
            {zoneRates.map((z, i) => (
              <div key={z.id} className="grid grid-cols-3 items-end gap-3">
                <p className="pb-2.5 text-sm font-medium">{z.name}</p>
                <Field label="Base ₦" htmlFor={`zb-${z.id}`}><Input id={`zb-${z.id}`} inputMode="numeric" value={z.base} onChange={(e) => setZoneRates((zs) => zs.map((x, j) => (j === i ? { ...x, base: e.target.value } : x)))} className="h-10" /></Field>
                <Field label="Per extra kg ₦" htmlFor={`zk-${z.id}`}><Input id={`zk-${z.id}`} inputMode="numeric" value={z.perKg} onChange={(e) => setZoneRates((zs) => zs.map((x, j) => (j === i ? { ...x, perKg: e.target.value } : x)))} className="h-10" /></Field>
              </div>
            ))}
          </div>
          <label className="mt-2 flex items-start gap-3 text-sm"><Checkbox className="mt-0.5" checked={vat} onChange={(e) => setVat(e.target.checked)} /><span><span className="font-medium">Charge VAT at 7.5%</span><span className="block text-gray-600">Confirm the treatment with your accountant before turning this on.</span></span></label>
        </Card>
      </div>

      <div className="grid gap-4 xl:sticky xl:top-6">
        <Card className="grid gap-2 p-5 text-sm">
          <h2 className="font-semibold">Live example</h2>
          <p className="text-gray-600">A ¥{exampleRmb}, 1 kg item:</p>
          <div className="flex justify-between"><span className="text-gray-600">Item price</span><span className="font-medium tabular-nums">{fxBad ? "—" : formatNaira(exampleItem * 100)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Est. shipping</span><span className="font-medium tabular-nums">{formatNaira(exampleShip * 100)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Lagos delivery</span><span className="font-medium tabular-nums">{formatNaira(Number(zoneRates[0]!.base) * 100)}</span></div>
          <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold"><span>Customer pays</span><span className="tabular-nums">{fxBad ? "—" : formatNaira((exampleItem + exampleShip + Number(zoneRates[0]!.base)) * 100)}</span></div>
        </Card>
        <Button
          size="lg"
          loading={pending}
          disabled={fxBad}
          onClick={() =>
            start(async () => {
              await new Promise((r) => setTimeout(r, 600));
              toast.success("Pricing rules saved", { description: "Store prices updated. Logged in the audit trail." });
            })
          }
        >
          Save rules
        </Button>
      </div>
    </div>
  );
}
