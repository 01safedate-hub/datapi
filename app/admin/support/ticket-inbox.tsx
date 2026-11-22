"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/misc";
import type { Ticket } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

const templates = [
  "Thanks for reaching out! Your order is on track and we'll update you at the next step.",
  "Your item weighed more than the supplier estimate, so the air freight cost went up. You can approve or ask for a refund from your order page.",
];

export function TicketInbox({ tickets }: { tickets: Ticket[] }) {
  const [list, setList] = useState(tickets);
  const [activeId, setActiveId] = useState(tickets[0]?.id);
  const [reply, setReply] = useState("");
  const t = list.find((x) => x.id === activeId);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card className="divide-y divide-gray-100">
        {list.map((x) => (
          <button key={x.id} type="button" onClick={() => setActiveId(x.id)} className={cn("block w-full px-4 py-3 text-left text-sm", x.id === activeId ? "bg-brand-50" : "hover:bg-gray-50")}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{x.customerName}</span>
              <Badge tone={x.status === "open" ? "warn" : x.status === "pending" ? "info" : "good"} className="capitalize">{x.status}</Badge>
            </div>
            <p className="truncate">{x.subject}</p>
            <p className="text-xs text-gray-500">{formatDateTime(x.updatedAt)}</p>
          </button>
        ))}
      </Card>
      {t && (
        <Card className="grid content-start gap-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-semibold">{t.subject}</h2>
              <p className="text-sm text-gray-600">{t.customerName}{t.orderNumber && <> · <Link href={`/admin/orders/${t.orderNumber}`} className="text-brand-600 hover:underline">{t.orderNumber}</Link></>}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setList((l) => l.map((x) => (x.id === t.id ? { ...x, status: "resolved" } : x))); toast.success("Marked resolved"); }} disabled={t.status === "resolved"}>Mark resolved</Button>
          </div>
          <p className="rounded-lg bg-gray-50 p-4 text-sm">{t.lastMessage}</p>
          <div className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <button key={tpl} type="button" onClick={() => setReply(tpl)} className="rounded-full border border-gray-200 px-3 py-1 text-xs hover:border-navy-900">{tpl.slice(0, 38)}…</button>
            ))}
          </div>
          <Textarea aria-label="Reply" placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
          <Button
            className="w-fit"
            disabled={!reply.trim()}
            onClick={() => {
              setList((l) => l.map((x) => (x.id === t.id ? { ...x, status: "pending", lastMessage: reply } : x)));
              setReply("");
              toast.success("Reply sent", { description: "Emailed to the customer." });
            }}
          >
            Send reply
          </Button>
        </Card>
      )}
    </div>
  );
}
