"use client";

import { Download, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { StageBadge } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Select } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { downloadCsv } from "@/lib/csv";
import { stageMeta } from "@/lib/stages";
import type { Order, OrderStage } from "@/lib/types";
import { formatDateTime, formatNaira } from "@/lib/utils";

const stages = Object.keys(stageMeta) as OrderStage[];

export function OrdersTable({ orders: initial, staff }: { orders: Order[]; staff: string[] }) {
  const params = useSearchParams();
  const [orders, setOrders] = useState(initial);
  const [q, setQ] = useState("");
  const [stage, setStage] = useState(params.get("stage") ?? "");
  const [provider, setProvider] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStage, setBulkStage] = useState("");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (!stage || o.stage === stage) &&
        (!provider || o.provider === provider) &&
        (!term || [o.number, o.customerName, o.email, o.phone].some((f) => f.toLowerCase().includes(term))),
    );
  }, [orders, q, stage, provider]);

  const allOn = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  function applyBulk() {
    if (!bulkStage) return;
    const n = selected.size;
    const before = orders;
    setOrders((os) => os.map((o) => (selected.has(o.id) ? { ...o, stage: bulkStage as OrderStage } : o)));
    setSelected(new Set());
    setBulkStage("");
    toast.success(`${n} order${n === 1 ? "" : "s"} moved to ${stageMeta[bulkStage as OrderStage].label}`, {
      description: "Customers will be notified by email.",
      action: { label: "Undo", onClick: () => setOrders(before) },
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <Input aria-label="Search orders" placeholder="Order number, name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 pl-9" />
        </div>
        <Select aria-label="Filter by stage" value={stage} onChange={(e) => setStage(e.target.value)} className="h-10 w-auto">
          <option value="">All stages</option>
          {stages.map((s) => <option key={s} value={s}>{stageMeta[s].label}</option>)}
        </Select>
        <Select aria-label="Filter by payment provider" value={provider} onChange={(e) => setProvider(e.target.value)} className="h-10 w-auto">
          <option value="">All gateways</option>
          <option value="paystack">Paystack</option>
          <option value="flutterwave">Flutterwave</option>
        </Select>
        <Button
          variant="outline"
          className="h-10"
          onClick={() => {
            downloadCsv(`shupzy-orders-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((o) => ({
              order: o.number, date: o.createdAt, customer: o.customerName, email: o.email, phone: o.phone, state: o.address.state,
              stage: stageMeta[o.stage].label, gateway: o.provider, total_ngn: o.totals.totalKobo / 100, paid_ngn: o.totals.paidKobo / 100, balance_ngn: o.totals.balanceDueKobo / 100,
            })));
            toast.success(`Exported ${rows.length} orders`);
          }}
        >
          <Download className="size-4" aria-hidden /> Export CSV
        </Button>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-navy-900 px-4 py-2.5 text-sm text-white" role="region" aria-label="Bulk actions">
          <span className="font-medium">{selected.size} selected</span>
          <Select aria-label="Move selected to stage" value={bulkStage} onChange={(e) => setBulkStage(e.target.value)} className="h-9 w-auto text-navy-900">
            <option value="">Move to stage…</option>
            {stages.map((s) => <option key={s} value={s}>{stageMeta[s].label}</option>)}
          </Select>
          <Button size="sm" variant="accent" disabled={!bulkStage} onClick={applyBulk}>Apply</Button>
          <Select aria-label="Assign to staff" defaultValue="" onChange={(e) => { if (e.target.value) { toast.success(`Assigned ${selected.size} to ${e.target.value}`); setSelected(new Set()); } }} className="h-9 w-auto text-navy-900">
            <option value="">Assign to…</option>
            {staff.map((s) => <option key={s}>{s}</option>)}
          </Select>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-white/70 hover:text-white">Clear</button>
        </div>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <caption className="sr-only">Orders</caption>
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs tracking-wide text-gray-600 uppercase">
            <tr>
              <th className="w-10 px-4 py-3"><Checkbox aria-label="Select all" checked={allOn} onChange={() => setSelected(allOn ? new Set() : new Set(rows.map((r) => r.id)))} /></th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Placed</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((o) => (
              <tr key={o.id} className={selected.has(o.id) ? "bg-brand-50" : "hover:bg-gray-50/70"}>
                <td className="px-4 py-3"><Checkbox aria-label={`Select ${o.number}`} checked={selected.has(o.id)} onChange={() => toggle(o.id)} /></td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.number}`} className="font-medium text-brand-600 hover:underline">{o.number}</Link>
                  {o.totals.balanceDueKobo > 0 && <span className="block text-xs text-orange-600">Balance {formatNaira(o.totals.balanceDueKobo)}</span>}
                </td>
                <td className="px-4 py-3">{o.customerName}<span className="block text-xs text-gray-500">{o.customerId ? o.address.state : "Guest"}</span></td>
                <td className="px-4 py-3"><StageBadge stage={o.stage} /></td>
                <td className="px-4 py-3">{o.items.reduce((s, i) => s + i.quantity, 0)}{o.items.some((i) => i.source === "imported") ? " · imported" : " · local"}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNaira(o.totals.totalKobo)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No orders match. <button type="button" className="font-medium text-brand-600 hover:underline" onClick={() => { setQ(""); setStage(""); setProvider(""); }}>Clear filters</button></td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
