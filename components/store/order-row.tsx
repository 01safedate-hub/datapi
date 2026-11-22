import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge, type Tone } from "@/components/ui/misc";
import { stageMeta } from "@/lib/stages";
import type { Order } from "@/lib/types";
import { formatDate, formatNaira, pluralize } from "@/lib/utils";

export function stageTone(stage: Order["stage"]): Tone {
  const t = stageMeta[stage].tone;
  return t === "neutral" ? "neutral" : t;
}

export function OrderRow({ order }: { order: Order }) {
  const count = order.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <li className="min-w-0">
      <Link href={`/account/orders/${order.number}`} className="flex items-center gap-4 rounded-card border border-gray-200 p-4 transition-colors hover:border-navy-900">
        <div className="flex -space-x-3">
          {order.items.slice(0, 3).map((i) => (
            <span key={i.productId} className="relative size-14 overflow-hidden rounded-lg border-2 border-white bg-gray-100">
              <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{order.number}</p>
            <Badge tone={stageTone(order.stage)}>{stageMeta[order.stage].customer}</Badge>
          </div>
          <p className="mt-0.5 truncate text-sm text-gray-600">{order.items.map((i) => i.name).join(", ")}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {formatDate(order.createdAt)} · {pluralize(count, "item")} · {formatNaira(order.totals.totalKobo)}
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-gray-400" aria-hidden />
      </Link>
    </li>
  );
}
