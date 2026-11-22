import { Check } from "lucide-react";
import { flowFor, stageMeta } from "@/lib/stages";
import type { Order, OrderStage } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

/** Vertical tracking timeline: done, current and upcoming stages with timestamps. */
export function OrderTimeline({ order, audience = "customer" }: { order: Order; audience?: "customer" | "admin" }) {
  const imported = order.items.some((i) => i.source === "imported");
  let flow: OrderStage[] = flowFor(imported, order.fulfilment);
  if (order.stage === "awaiting_balance") flow = [...flow.slice(0, flow.indexOf("china_warehouse") + 1), "awaiting_balance", ...flow.slice(flow.indexOf("china_warehouse") + 1)];
  if (order.stage === "refunded" || order.stage === "cancelled") flow = order.events.map((e) => e.stage);
  if (order.stage === "pending_payment") flow = ["pending_payment", ...flow];

  const at = new Map(order.events.map((e) => [e.stage, e]));
  const current = flow.indexOf(order.stage);

  return (
    <ol className="relative grid gap-0">
      {flow.map((stage, i) => {
        const done = i < current || order.stage === "delivered";
        const isCurrent = i === current && order.stage !== "delivered";
        const ev = at.get(stage);
        const meta = stageMeta[stage];
        return (
          <li key={stage} className="relative flex gap-4 pb-6 last:pb-0">
            {i < flow.length - 1 && (
              <span aria-hidden className={cn("absolute top-7 left-[13px] h-[calc(100%-1.5rem)] w-0.5", done ? "bg-navy-900" : "bg-gray-200")} />
            )}
            <span
              className={cn(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border-2",
                done && "border-navy-900 bg-navy-900 text-white",
                isCurrent && (meta.tone === "warn" ? "border-orange-500 bg-orange-50" : "border-brand-600 bg-brand-50"),
                !done && !isCurrent && "border-gray-200 bg-white",
              )}
            >
              {done ? <Check className="size-4" aria-hidden /> : isCurrent ? <span className={cn("size-2.5 rounded-full", meta.tone === "warn" ? "bg-orange-500" : "bg-brand-600 animate-pulse")} /> : null}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn("text-sm font-medium", !done && !isCurrent && "text-gray-500", isCurrent && "font-semibold")}>
                {audience === "customer" ? meta.customer : meta.label}
                {isCurrent && <span className="sr-only"> (current step)</span>}
              </p>
              {ev && (
                <p className="text-xs text-gray-500">
                  {formatDateTime(ev.at)}
                  {audience === "admin" && ` · ${ev.by}`}
                </p>
              )}
              {ev?.note && <p className="mt-1 text-sm text-gray-700">{ev.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
