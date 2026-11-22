"use client";

import { CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Badge, Card, EmptyState } from "@/components/ui/misc";
import { formatRmb } from "@/lib/utils";

export type QueueItem = {
  key: string;
  order: string;
  placedAt: string;
  name: string;
  image: string;
  options: string;
  quantity: number;
  expectedFen: number;
  origin: "manual" | "alibaba";
};

function hoursSince(iso: string) {
  return Math.max(0, Math.round((Date.parse("2026-11-22T08:00:00.000Z") - Date.parse(iso)) / 3_600_000));
}

function Row({ item, suppliers, onDone }: { item: QueueItem; suppliers: { id: string; name: string }[]; onDone: () => void }) {
  const [supplier, setSupplier] = useState("");
  const [ref, setRef] = useState("");
  const [rmb, setRmb] = useState((item.expectedFen / 100).toFixed(2));
  const [err, setErr] = useState<Record<string, string>>({});
  const age = hoursSince(item.placedAt);
  const diff = Number(rmb) * 100 - item.expectedFen;

  return (
    <Card className="grid gap-4 p-5 lg:grid-cols-[1fr_1.4fr]">
      <div className="flex gap-4">
        <Image src={item.image} alt="" width={64} height={64} className="size-16 rounded-lg bg-gray-100" />
        <div className="text-sm">
          <p className="font-medium">{item.name}</p>
          <p className="text-gray-600">{item.options || "No options"} · Qty {item.quantity}</p>
          <p className="mt-1 flex flex-wrap items-center gap-2">
            <Link href={`/admin/orders/${item.order}`} className="font-medium text-brand-600 hover:underline">{item.order}</Link>
            <Badge tone={age > 48 ? "bad" : age > 24 ? "warn" : "neutral"}><Clock className="size-3" aria-hidden />{age}h waiting</Badge>
            {item.origin === "alibaba" && <Badge tone="info">Alibaba</Badge>}
          </p>
        </div>
      </div>
      <form
        className="grid gap-3 sm:grid-cols-[1.3fr_1fr_0.8fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          const er: Record<string, string> = {};
          if (!supplier) er.supplier = "Pick a supplier";
          if (!ref.trim()) er.ref = "Add the supplier order no.";
          if (!(Number(rmb) > 0)) er.rmb = "Enter amount";
          setErr(er);
          if (Object.keys(er).length) return;
          onDone();
          toast.success(`${item.order}: marked as purchased`, { description: diff > 0 ? `Supplier charged ${formatRmb(diff)} more than expected. Review margin.` : "Customer notified." });
        }}
      >
        <Field label="Supplier" htmlFor={`${item.key}-s`} error={err.supplier}>
          <Select id={`${item.key}-s`} value={supplier} onChange={(e) => setSupplier(e.target.value)} className="h-10" aria-invalid={!!err.supplier || undefined}>
            <option value="">Choose…</option>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </Field>
        <Field label="Supplier order no." htmlFor={`${item.key}-r`} error={err.ref}>
          <Input id={`${item.key}-r`} value={ref} onChange={(e) => setRef(e.target.value)} className="h-10" aria-invalid={!!err.ref || undefined} />
        </Field>
        <Field label="Paid (¥)" htmlFor={`${item.key}-m`} error={err.rmb}>
          <Input id={`${item.key}-m`} inputMode="decimal" value={rmb} onChange={(e) => setRmb(e.target.value)} className="h-10" aria-invalid={!!err.rmb || undefined} />
        </Field>
        <Button type="submit" className="h-10">Mark purchased</Button>
        {diff > 0 && <p className="text-xs text-orange-600 sm:col-span-4">{formatRmb(diff)} above the listed supplier price. If this changes the customer price, send them an approval request from the order page.</p>}
      </form>
    </Card>
  );
}

export function SourcingQueue({ items, suppliers }: { items: QueueItem[]; suppliers: { id: string; name: string }[] }) {
  const [list, setList] = useState(items);
  if (!list.length) return <EmptyState icon={CheckCircle2} title="Queue is clear" description="Every paid imported item has been bought from a supplier." />;
  return (
    <ul className="grid gap-3">
      {list.map((i) => (
        <li key={i.key}>
          <Row item={i} suppliers={suppliers} onDone={() => setList((l) => l.filter((x) => x.key !== i.key))} />
        </li>
      ))}
    </ul>
  );
}
