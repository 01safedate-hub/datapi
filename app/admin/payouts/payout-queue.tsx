"use client";

import { Check, Snowflake } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/misc";
import type { PayoutRow } from "@/lib/marketplace";
import type { PayoutStatus } from "@/lib/types";
import { formatDateTime, formatNaira } from "@/lib/utils";

const labels: Record<PayoutStatus, { label: string; tone: "neutral" | "info" | "warn" | "good" | "bad" }> = {
  held: { label: "Held · in transit", tone: "neutral" },
  awaiting_approval: { label: "Ready to approve", tone: "warn" },
  approved: { label: "Approved", tone: "info" },
  paid: { label: "Paid out", tone: "good" },
  frozen: { label: "Frozen · dispute", tone: "bad" },
  not_applicable: { label: "Alaba stock", tone: "neutral" },
};

export function PayoutQueue({ rows: initial }: { rows: PayoutRow[] }) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<"" | PayoutStatus>("awaiting_approval");
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();
  const shown = filter ? rows.filter((r) => r.status === filter) : rows;

  const act = (r: PayoutRow, to: PayoutStatus, msg: string) => {
    setBusy(r.id);
    start(async () => {
      await new Promise((res) => setTimeout(res, 600));
      setRows((all) => all.map((x) => (x.id === r.id ? { ...x, status: to } : x)));
      setBusy(null);
      toast.success(msg, { description: `${r.storeName} · ${r.orderNumber} · ${formatNaira(r.netKobo)}` });
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select aria-label="Filter payouts" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-10 w-auto">
          <option value="">All payouts</option>
          {(["awaiting_approval", "held", "frozen", "approved", "paid"] as const).map((s) => <option key={s} value={s}>{labels[s].label}</option>)}
        </Select>
        <span className="text-sm text-gray-500">{shown.length} shown</span>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <caption className="sr-only">Seller payouts</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs tracking-wide text-gray-600 uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Seller / order</th>
              <th className="px-4 py-3 font-medium">Delivery</th>
              <th className="px-4 py-3 text-right font-medium">Sale</th>
              <th className="px-4 py-3 text-right font-medium">Commission</th>
              <th className="px-4 py-3 text-right font-medium">Payout</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shown.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-500">Nothing waiting. Payouts appear here once orders are delivered.</td></tr>}
            {shown.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3"><p className="font-medium">{r.storeName}</p><Link href={`/admin/orders/${r.orderNumber}`} className="text-xs text-brand-600 hover:underline">{r.orderNumber}</Link></td>
                <td className="px-4 py-3 text-xs text-gray-600">
                  {r.deliveredAt ? <>Delivered {formatDateTime(r.deliveredAt)}<br />{r.buyerConfirmed ? <span className="font-medium text-green-700">Buyer confirmed</span> : <>Auto-confirms {formatDateTime(r.autoConfirmAt!)}</>}</> : "Not delivered yet"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNaira(r.grossKobo)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-gray-600">−{formatNaira(r.commissionKobo)}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatNaira(r.netKobo)}</td>
                <td className="px-4 py-3"><Badge tone={labels[r.status].tone}>{labels[r.status].label}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {r.status === "awaiting_approval" && (
                      <>
                        <Button size="sm" loading={busy === r.id} onClick={() => act(r, "approved", "Payout approved")}><Check className="size-4" aria-hidden />Approve</Button>
                        <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => act(r, "frozen", "Payout frozen")} aria-label={`Freeze payout for ${r.orderNumber}`}><Snowflake className="size-4" aria-hidden /></Button>
                      </>
                    )}
                    {r.status === "approved" && <Button size="sm" variant="outline" loading={busy === r.id} onClick={() => act(r, "paid", "Marked as paid")}>Mark paid</Button>}
                    {r.status === "frozen" && <Button size="sm" variant="outline" loading={busy === r.id} onClick={() => act(r, "awaiting_approval", "Dispute resolved, payout released for approval")}>Release</Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="text-xs text-gray-500">Approved payouts are sent by Paystack Transfer to the seller&apos;s verified bank account. Every approval is recorded in the audit log.</p>
    </div>
  );
}
