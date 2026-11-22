import { AlertTriangle, Heart, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { OrderRow } from "@/components/store/order-row";
import { ButtonLink } from "@/components/ui/button";
import { Callout, Card, SectionHeader } from "@/components/ui/misc";
import { getMyOrders } from "@/lib/orders";
import { formatNaira } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default function AccountOverview() {
  const orders = getMyOrders();
  const active = orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.stage));
  const due = orders.filter((o) => o.totals.balanceDueKobo > 0);
  const stats = [
    { label: "Active orders", value: active.length, icon: Package, href: "/account/orders" },
    { label: "Saved addresses", value: 2, icon: MapPin, href: "/account/addresses" },
    { label: "Wishlist", value: "View", icon: Heart, href: "/account/wishlist" },
  ];

  return (
    <div className="grid gap-8">
      {due.map((o) => (
        <Callout key={o.number} tone="orange" icon={AlertTriangle} title={`Action needed on ${o.number}`}>
          A shipping balance of <strong>{formatNaira(o.totals.balanceDueKobo)}</strong> is waiting for your approval before your item can fly to Lagos.{" "}
          <Link href={`/account/orders/${o.number}`} className="font-medium underline">Review and pay</Link>
        </Callout>
      ))}

      <ul className="grid grid-cols-3 gap-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <li key={label}>
            <Link href={href} className="block rounded-card border border-gray-200 p-4 hover:border-navy-900">
              <Icon className="size-5 text-brand-600" aria-hidden />
              <p className="mt-3 text-2xl font-semibold">{value}</p>
              <p className="text-sm text-gray-600">{label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section>
        <SectionHeader title="Recent orders" href="/account/orders" />
        {orders.length ? (
          <ul className="grid gap-3">{orders.slice(0, 3).map((o) => <OrderRow key={o.id} order={o} />)}</ul>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-600">No orders yet.</p>
            <ButtonLink href="/shop" variant="accent" className="mt-4">Start shopping</ButtonLink>
          </Card>
        )}
      </section>
    </div>
  );
}
