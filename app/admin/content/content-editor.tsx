"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const pages = [
  ["Home hero", "/"], ["How it works", "/how-it-works"], ["Shipping", "/shipping"], ["FAQ", "/faq"], ["About", "/about"],
  ["Refund policy", "/refund-policy"], ["Terms", "/terms"], ["Privacy", "/privacy"],
] as const;

const emails = [
  { id: "order_confirmed", name: "Order confirmed", subject: "Your Shupzy order {{order_number}} is confirmed", body: "Hi {{first_name}},\n\nThanks for your order. We've received {{total}} and will order your items from the supplier within 48 hours.\n\nTrack it any time: {{tracking_link}}\n\nThe Shupzy team" },
  { id: "balance_due", name: "Shipping balance request", subject: "Action needed: shipping for {{order_number}}", body: "Hi {{first_name}},\n\nYour item weighed {{chargeable_kg}} kg at our China warehouse, so air freight costs {{balance}} more than estimated. Nothing has been charged.\n\nApprove and pay, or choose a refund: {{approval_link}}" },
  { id: "dispatched", name: "Dispatched", subject: "{{order_number}} is on its way to Lagos", body: "Hi {{first_name}},\n\nYour order is on a flight to Lagos. Air waybill: {{waybill}}. Expected in Lagos by {{eta}}." },
  { id: "delivered", name: "Delivered", subject: "Delivered: {{order_number}}", body: "Hi {{first_name}},\n\nYour order has been delivered. Something not right? Reply to this email within 48 hours." },
];

export function ContentEditor() {
  const [active, setActive] = useState(emails[0]!.id);
  const [tpl, setTpl] = useState(emails);
  const e = tpl.find((x) => x.id === active)!;

  return (
    <div className="grid gap-6">
      <Card className="p-5">
        <h2 className="mb-3 font-semibold">Store pages</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {pages.map(([name, href]) => (
            <li key={href} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
              {name}
              <Link href={href} target="_blank" className="text-gray-500 hover:text-navy-900" aria-label={`Preview ${name}`}><ExternalLink className="size-4" /></Link>
            </li>
          ))}
        </ul>
      </Card>
      <Card className="grid gap-4 p-5 lg:grid-cols-[220px_1fr]">
        <div>
          <h2 className="mb-3 font-semibold">Email templates</h2>
          <ul className="grid gap-1">
            {tpl.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => setActive(t.id)} className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", t.id === active ? "bg-navy-900 text-white" : "hover:bg-gray-100")}>{t.name}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-4">
          <Field label="Subject" htmlFor="e-subject"><Input id="e-subject" value={e.subject} onChange={(ev) => setTpl((l) => l.map((x) => (x.id === active ? { ...x, subject: ev.target.value } : x)))} /></Field>
          <Field label="Body" htmlFor="e-body" hint="Variables in {{double braces}} are filled in automatically."><Textarea id="e-body" className="min-h-56 font-mono text-sm" value={e.body} onChange={(ev) => setTpl((l) => l.map((x) => (x.id === active ? { ...x, body: ev.target.value } : x)))} /></Field>
          <div className="flex gap-2">
            <Button onClick={() => toast.success(`“${e.name}” template saved`)}>Save template</Button>
            <Button variant="outline" onClick={() => toast.success("Test email sent to owner@shupzy.com")}>Send test</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
