import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, Card } from "@/components/ui/misc";
import { stageMeta } from "@/lib/stages";
import type { OrderStage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, sub, icon: Icon, tone = "default" }: { label: string; value: ReactNode; sub?: ReactNode; icon?: LucideIcon; tone?: "default" | "warn" }) {
  return (
    <Card className={cn("p-5", tone === "warn" && "border-orange-500/50 bg-orange-50")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-600">{label}</p>
        {Icon && <Icon className={cn("size-4.5", tone === "warn" ? "text-orange-600" : "text-brand-600")} aria-hidden />}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </Card>
  );
}

export function StageBadge({ stage }: { stage: OrderStage }) {
  const m = stageMeta[stage];
  return <Badge tone={m.tone === "neutral" ? "neutral" : m.tone}>{m.label}</Badge>;
}

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
};

/** Plain, accessible data table for server-rendered admin lists. */
export function DataTable<T>({ rows, columns, rowKey, caption, empty = "Nothing here yet." }: { rows: T[]; columns: Column<T>[]; rowKey: (r: T) => string; caption: string; empty?: string }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs tracking-wide text-gray-600 uppercase">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("px-4 py-3 font-medium", c.align === "right" && "text-right")}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length ? (
            rows.map((r) => (
              <tr key={rowKey(r)} className="hover:bg-gray-50/70">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 align-middle", c.align === "right" && "text-right tabular-nums", c.className)}>{c.cell(r)}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-gray-500">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
