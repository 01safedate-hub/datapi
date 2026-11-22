import { Package } from "lucide-react";
import { OrderRow } from "@/components/store/order-row";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { getMyOrders } from "@/lib/orders";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  const orders = getMyOrders();
  const active = orders.filter((o) => !["delivered", "cancelled", "refunded"].includes(o.stage));
  const past = orders.filter((o) => !active.includes(o));

  if (!orders.length) {
    return <EmptyState icon={Package} title="No orders yet" description="When you place an order, you can track every step here." action={<ButtonLink href="/shop" variant="accent">Start shopping</ButtonLink>} />;
  }

  return (
    <div className="grid gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">In progress ({active.length})</h2>
        {active.length ? <ul className="grid grid-cols-1 gap-3">{active.map((o) => <OrderRow key={o.id} order={o} />)}</ul> : <p className="text-gray-600">Nothing on the way right now.</p>}
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Completed</h2>
          <ul className="grid grid-cols-1 gap-3">{past.map((o) => <OrderRow key={o.id} order={o} />)}</ul>
        </section>
      )}
    </div>
  );
}
