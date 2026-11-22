"use client";

import { ArrowRight, RotateCcw, Send } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { Sheet } from "@/components/ui/sheet";
import { stageMeta } from "@/lib/stages";
import type { OrderStage } from "@/lib/types";
import { formatNaira } from "@/lib/utils";

export function StageMover({ number, stage, next }: { number: string; stage: OrderStage; next: OrderStage[] }) {
  const [current, setCurrent] = useState(stage);
  const [target, setTarget] = useState<OrderStage | "">(next[0] ?? "");
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState("");
  const [pending, start] = useTransition();

  if (!next.length || current !== stage) {
    return (
      <Card className="p-5 text-sm">
        <p className="font-semibold">Stage: {stageMeta[current].label}</p>
        <p className="mt-1 text-gray-600">{current !== stage ? "Updated. The customer has been notified." : "No further stages for this order."}</p>
      </Card>
    );
  }

  return (
    <Card className="grid gap-4 p-5">
      <h2 className="font-semibold">Move order forward</h2>
      <Field label="Next stage" htmlFor="next-stage">
        <Select id="next-stage" value={target} onChange={(e) => setTarget(e.target.value as OrderStage)}>
          {next.map((s) => <option key={s} value={s}>{stageMeta[s].label}</option>)}
        </Select>
      </Field>
      {target === "dispatched" && (
        <Field label="Air waybill / tracking number" htmlFor="tracking">
          <Input id="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="176-…" />
        </Field>
      )}
      <Field label="Note to customer" htmlFor="stage-note" optional>
        <Textarea id="stage-note" className="min-h-20" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <p className="text-xs text-gray-500">The customer gets: “{target ? stageMeta[target].customer : ""}” by email{target && ["dispatched", "out_for_delivery", "awaiting_balance"].includes(target) ? " and WhatsApp" : ""}.</p>
      <Button
        loading={pending}
        onClick={() =>
          start(async () => {
            if (target === "dispatched" && !tracking.trim()) {
              toast.error("Add the air waybill so the customer can track the flight");
              return;
            }
            await new Promise((r) => setTimeout(r, 500));
            setCurrent(target as OrderStage);
            toast.success(`${number} moved to ${stageMeta[target as OrderStage].label}`, { description: "Customer notified." });
          })
        }
      >
        Update stage <ArrowRight className="size-4" aria-hidden />
      </Button>
    </Card>
  );
}

export function InternalNotes({ initial }: { initial: string[] }) {
  const [notes, setNotes] = useState(initial);
  const [draft, setDraft] = useState("");
  return (
    <Card className="grid gap-3 p-5">
      <h2 className="font-semibold">Internal notes</h2>
      {notes.length ? (
        <ul className="grid gap-2 text-sm">{notes.map((n, i) => <li key={i} className="rounded-lg bg-gray-50 px-3 py-2">{n}</li>)}</ul>
      ) : (
        <p className="text-sm text-gray-500">No notes yet. Only staff can see these.</p>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          setNotes((n) => [...n, draft.trim()]);
          setDraft("");
          toast.success("Note added");
        }}
      >
        <Input aria-label="New note" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note…" className="h-10" />
        <Button type="submit" variant="outline" className="h-10" aria-label="Add note"><Send className="size-4" /></Button>
      </form>
    </Card>
  );
}

export function RefundButton({ number, paidKobo }: { number: string; paidKobo: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(paidKobo / 100));
  const [reason, setReason] = useState("supplier_unavailable");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={!paidKobo}>
        <RotateCcw className="size-4" aria-hidden /> Refund
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={`Refund ${number}`}
        footer={
          <Button
            variant="danger"
            className="w-full"
            loading={pending}
            onClick={() => {
              const n = Number(amount);
              if (!n || n <= 0 || n * 100 > paidKobo) return setError(`Enter an amount between ₦1 and ${formatNaira(paidKobo)}`);
              start(async () => {
                await new Promise((r) => setTimeout(r, 700));
                setOpen(false);
                toast.success(`Refund of ₦${n.toLocaleString()} sent for approval`, { description: "Finance Manager approves refunds over ₦50,000." });
              });
            }}
          >
            Issue refund
          </Button>
        }
      >
        <div className="grid gap-4">
          <Field label="Amount (₦)" htmlFor="ref-amt" error={error} hint={`Paid: ${formatNaira(paidKobo)}. Partial refunds allowed.`}>
            <Input id="ref-amt" inputMode="decimal" value={amount} onChange={(e) => { setAmount(e.target.value.replace(/[^\d.]/g, "")); setError(""); }} aria-invalid={!!error || undefined} />
          </Field>
          <Field label="Reason" htmlFor="ref-reason">
            <Select id="ref-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="supplier_unavailable">Supplier unavailable</option>
              <option value="customer_cancelled">Customer cancelled</option>
              <option value="damaged">Damaged item</option>
              <option value="missing">Missing item</option>
              <option value="lost">Lost shipment</option>
              <option value="shipping_overpaid">Shipping overpaid</option>
            </Select>
          </Field>
          <p className="text-sm text-gray-600">The refund goes back through the original gateway. The customer is emailed when it&apos;s sent and when it completes.</p>
        </div>
      </Sheet>
    </>
  );
}
