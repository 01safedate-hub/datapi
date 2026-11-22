import { PageHeader } from "@/components/admin/ui";
import { products } from "@/lib/data/catalog";
import { orders } from "@/lib/data/ops";
import { defaultAgent } from "@/lib/data/settings";
import { WeighStation, type ParcelToWeigh } from "./weigh-station";

export const metadata = { title: "China warehouse" };

export default function WarehousePage() {
  const parcels: ParcelToWeigh[] = orders
    .filter((o) => o.stage === "china_warehouse" || o.stage === "purchased")
    .map((o) => {
      const imported = o.items.filter((i) => i.source === "imported");
      const dims = imported.map((i) => products.find((p) => p.id === i.productId)?.dimsCm ?? [20, 20, 10]);
      return {
        order: o.number,
        arrived: o.stage === "china_warehouse",
        customer: o.customerName,
        items: imported.map((i) => `${i.quantity}× ${i.name}`),
        estKg: imported.reduce((s, i) => s + i.estWeightKg * i.quantity, 0),
        estDims: dims[0] as [number, number, number],
        paidShippingKobo: o.totals.intlShippingKobo,
      };
    });

  return (
    <>
      <PageHeader
        title="China warehouse"
        description={`Weigh and measure each parcel. Chargeable weight = max(actual, L×W×H ÷ ${defaultAgent.volumetricDivisor}). Any shortfall is sent to the customer for approval before dispatch.`}
      />
      <WeighStation parcels={parcels} />
    </>
  );
}
