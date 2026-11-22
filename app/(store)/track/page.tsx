import { PackageSearch, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { OrderTimeline } from "@/components/order-timeline";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Badge, Callout, Card } from "@/components/ui/misc";
import { findOrderForGuest } from "@/lib/orders";
import type { SearchParams } from "@/lib/params";
import { whatsappLink } from "@/lib/site";
import { stageMeta } from "@/lib/stages";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Track any Shupzy order with your order number and the email or phone you used at checkout.",
  alternates: { canonical: "/track" },
};

export default async function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const number = typeof sp.order === "string" ? sp.order.trim().toUpperCase() : "";
  const contact = typeof sp.contact === "string" ? sp.contact.trim() : "";
  const searched = Boolean(number && contact);
  const order = searched ? findOrderForGuest(number, contact) : null;

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <div className="text-center">
        <PackageSearch className="mx-auto size-10 text-brand-600" aria-hidden />
        <h1 className="mt-3 text-3xl font-semibold">Track your order</h1>
        <p className="mt-2 text-gray-600">No account needed. Use the details from your confirmation email.</p>
      </div>

      <Card className="mt-8 p-5 sm:p-6">
        <form action="/track" className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Order number" htmlFor="order">
            <Input id="order" name="order" placeholder="SHZ-10482" defaultValue={number} required autoCapitalize="characters" />
          </Field>
          <Field label="Email or phone" htmlFor="contact">
            <Input id="contact" name="contact" placeholder="you@example.com" defaultValue={contact} required />
          </Field>
          <Button type="submit" className="h-11">Track</Button>
        </form>
        <p className="mt-3 text-xs text-gray-500">Demo: try SHZ-10482 with adaeze@example.com</p>
      </Card>

      {searched && !order && (
        <Callout tone="warn" icon={SearchX} title="We couldn't find that order" className="mt-6">
          Check the order number (it starts with SHZ-) and use the same email or phone you used at checkout. Just ordered? It can take a minute to appear.{" "}
          <a href={whatsappLink(`Hi Shupzy, I can't find my order ${number}`)} className="font-medium underline" target="_blank" rel="noopener noreferrer">Ask us on WhatsApp</a>
        </Callout>
      )}

      {order && (
        <Card className="mt-6 p-5 sm:p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Order {order.number} · placed {formatDate(order.createdAt)}</p>
              <p className="mt-1 text-xl font-semibold">{stageMeta[order.stage].customer}</p>
            </div>
            <Badge tone={stageMeta[order.stage].tone === "warn" ? "warn" : stageMeta[order.stage].tone === "good" ? "good" : "info"}>{stageMeta[order.stage].label}</Badge>
          </div>
          {order.stage === "awaiting_balance" && (
            <Callout tone="orange" title="Your action is needed" className="mb-6">
              Your item weighed more than estimated. Approve the shipping balance so we can put it on the next flight.{" "}
              <Link href={`/account/orders/${order.number}`} className="font-medium underline">Review and pay</Link>
            </Callout>
          )}
          {order.trackingNumbers.length > 0 && <p className="mb-5 text-sm">Air waybill: <span className="font-mono font-medium">{order.trackingNumbers.join(", ")}</span></p>}
          <OrderTimeline order={order} />
          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200 pt-5">
            <ButtonLink href={`/account/orders/${order.number}`} variant="outline" size="sm">Full order details</ButtonLink>
            <ButtonLink href={whatsappLink(`Hi Shupzy, question about order ${order.number}`)} variant="ghost" size="sm" target="_blank" rel="noopener noreferrer">Get help with this order</ButtonLink>
          </div>
        </Card>
      )}
    </div>
  );
}
