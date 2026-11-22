"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { stageMeta } from "@/lib/stages";
import type { OrderStage } from "@/lib/types";

export type DeliveryCard = { number: string; stage: OrderStage; customer: string; phone: string; where: string; pickup: boolean; items: number };

const columns: { title: string; stages: OrderStage[] }[] = [
  { title: "Inbound (Lagos)", stages: ["arrived_ng", "customs_cleared"] },
  { title: "At Lagos warehouse", stages: ["ng_warehouse"] },
  { title: "Out / ready", stages: ["out_for_delivery", "ready_for_pickup"] },
  { title: "Delivered today", stages: ["delivered"] },
];

const next: Partial<Record<OrderStage, OrderStage>> = {
  arrived_ng: "customs_cleared",
  customs_cleared: "ng_warehouse",
  out_for_delivery: "delivered",
  ready_for_pickup: "delivered",
};

export function DeliveryBoard({ cards: initial }: { cards: DeliveryCard[] }) {
  const [cards, setCards] = useState(initial);
  const move = (n: string, stage: OrderStage) => {
    setCards((cs) => cs.map((c) => (c.number === n ? { ...c, stage } : c)));
    toast.success(`${n}: ${stageMeta[stage].label}`, { description: "Customer notified." });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => {
        const list = cards.filter((c) => col.stages.includes(c.stage));
        return (
          <section key={col.title} aria-label={col.title} className="rounded-card bg-gray-100 p-3">
            <h2 className="mb-3 px-1 text-sm font-semibold">{col.title} <span className="text-gray-500">{list.length}</span></h2>
            <ul className="grid gap-2">
              {list.map((c) => (
                <li key={c.number}>
                  <Card className="grid gap-2 p-3 text-sm">
                    <div className="flex justify-between gap-2">
                      <Link href={`/admin/orders/${c.number}`} className="font-medium text-brand-600 hover:underline">{c.number}</Link>
                      <span className="text-xs text-gray-500">{c.items} items</span>
                    </div>
                    <p>{c.customer}<span className="block text-xs text-gray-500">{c.where}</span></p>
                    {c.stage === "ng_warehouse" ? (
                      c.pickup ? (
                        <Button size="sm" variant="outline" onClick={() => move(c.number, "ready_for_pickup")}>Ready for pickup</Button>
                      ) : (
                        <Select aria-label={`Assign courier for ${c.number}`} defaultValue="" onChange={(e) => e.target.value && move(c.number, "out_for_delivery")} className="h-9 text-sm">
                          <option value="">Assign courier…</option>
                          <option>In-house rider</option>
                          <option>GIG Logistics</option>
                          <option>Kwik Delivery</option>
                        </Select>
                      )
                    ) : next[c.stage] ? (
                      <Button size="sm" variant={next[c.stage] === "delivered" ? "primary" : "outline"} onClick={() => move(c.number, next[c.stage]!)}>
                        Mark {stageMeta[next[c.stage]!].label.toLowerCase()}
                      </Button>
                    ) : null}
                  </Card>
                </li>
              ))}
              {!list.length && <li className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-xs text-gray-500">Empty</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
