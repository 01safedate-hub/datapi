"use client";

import { CheckCircle2, PackageCheck, Scale } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Badge, Card, EmptyState } from "@/components/ui/misc";
import { defaultAgent } from "@/lib/data/settings";
import { chargeableKg, volumetricKg } from "@/lib/pricing";
import { formatKg, formatNaira } from "@/lib/utils";

export type ParcelToWeigh = {
  order: string;
  arrived: boolean;
  customer: string;
  items: string[];
  estKg: number;
  estDims: [number, number, number];
  paidShippingKobo: number;
};

function Parcel({ p, onDone }: { p: ParcelToWeigh; onDone: () => void }) {
  const [arrived, setArrived] = useState(p.arrived);
  const [kg, setKg] = useState("");
  const [dims, setDims] = useState<[string, string, string]>(["", "", ""]);
  const n = dims.map(Number) as [number, number, number];
  const ready = Number(kg) > 0 && n.every((d) => d > 0);
  const charge = ready ? chargeableKg(Number(kg), n) : 0;
  const cost = Math.ceil((charge * (defaultAgent.ratePerKgKobo + defaultAgent.clearancePerKgKobo)) / 5000) * 5000;
  const diff = cost - p.paidShippingKobo;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <Link href={`/admin/orders/${p.order}`} className="font-semibold text-brand-600 hover:underline">{p.order}</Link>
            <Badge tone={arrived ? "info" : "neutral"}>{arrived ? "Arrived" : "Expected"}</Badge>
          </div>
          <p className="text-gray-600">{p.customer}</p>
          <ul className="mt-1 text-gray-700">{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
        <p className="text-right text-xs text-gray-500">Estimate: {formatKg(p.estKg)} · {p.estDims.join("×")} cm<br />Customer paid {formatNaira(p.paidShippingKobo)} shipping</p>
      </div>

      {!arrived ? (
        <Button className="mt-4" variant="outline" size="sm" onClick={() => { setArrived(true); toast.success(`${p.order} checked in at China warehouse`, { description: "Customer notified." }); }}>
          <PackageCheck className="size-4" aria-hidden /> Check in parcel
        </Button>
      ) : (
        <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-[1fr_1fr]">
          <div className="grid grid-cols-4 gap-2">
            <Field label="Weight kg" htmlFor={`${p.order}-kg`}><Input id={`${p.order}-kg`} inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} className="h-10" /></Field>
            {(["L", "W", "H"] as const).map((l, i) => (
              <Field key={l} label={`${l} cm`} htmlFor={`${p.order}-${l}`}>
                <Input id={`${p.order}-${l}`} inputMode="numeric" value={dims[i]} onChange={(e) => setDims((d) => d.map((x, j) => (j === i ? e.target.value : x)) as [string, string, string])} className="h-10" />
              </Field>
            ))}
          </div>
          <div className="grid content-end gap-2 rounded-lg bg-gray-50 p-4 text-sm">
            {ready ? (
              <>
                <p className="flex justify-between"><span className="text-gray-600">Volumetric</span><span className="tabular-nums">{formatKg(volumetricKg(n, defaultAgent.volumetricDivisor))}</span></p>
                <p className="flex justify-between font-medium"><span>Chargeable</span><span className="tabular-nums">{formatKg(charge)}</span></p>
                <p className="flex justify-between"><span className="text-gray-600">Actual shipping cost</span><span className="tabular-nums">{formatNaira(cost)}</span></p>
                <p className={`flex justify-between font-semibold ${diff > 0 ? "text-orange-600" : "text-green-700"}`}>
                  <span>{diff > 0 ? "Customer owes" : "Refund to customer"}</span>
                  <span className="tabular-nums">{formatNaira(Math.abs(diff))}</span>
                </p>
                <Button
                  size="sm"
                  variant={diff > 0 ? "accent" : "primary"}
                  className="mt-1"
                  onClick={() => {
                    onDone();
                    toast.success(diff > 0 ? `Balance request of ${formatNaira(diff)} sent` : "Weighed and ready for the next flight", {
                      description: diff > 0 ? "Customer gets an email and WhatsApp with an Approve and pay link." : diff < 0 ? `${formatNaira(-diff)} refund queued for Finance.` : undefined,
                    });
                  }}
                >
                  {diff > 0 ? "Send balance request" : "Confirm, ready to ship"}
                </Button>
              </>
            ) : (
              <p className="flex items-center gap-2 text-gray-500"><Scale className="size-4" aria-hidden /> Enter weight and dimensions to calculate.</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export function WeighStation({ parcels }: { parcels: ParcelToWeigh[] }) {
  const [list, setList] = useState(parcels);
  if (!list.length) return <EmptyState icon={CheckCircle2} title="Nothing to weigh" description="All arrived parcels have been weighed." />;
  return (
    <ul className="grid gap-3">
      {list.map((p) => (
        <li key={p.order}><Parcel p={p} onDone={() => setList((l) => l.filter((x) => x.order !== p.order))} /></li>
      ))}
    </ul>
  );
}
