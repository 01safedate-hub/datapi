import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { defaultAgent, deliveryZones, pickupPoints } from "@/lib/data/settings";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping and delivery",
  description: "Air freight from China to Lagos, customs, and doorstep delivery or pickup anywhere in Nigeria.",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <ContentPage title="Shipping and delivery" intro="Estimated delivery windows, not guarantees, but we keep you updated at every step.">
      <h2>From China to Lagos</h2>
      <ul>
        <li>Air freight, {defaultAgent.transitDays[0]}–{defaultAgent.transitDays[1]} days in transit after dispatch.</li>
        <li>Total time from order to Lagos is usually 10–18 days.</li>
        <li>Shipping and customs are estimated at checkout and confirmed after weighing.</li>
      </ul>
      <h2>Delivery within Nigeria</h2>
      <div className="overflow-x-auto rounded-card border border-gray-200">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr><th className="px-4 py-2.5 font-medium">Zone</th><th className="px-4 py-2.5 font-medium">From</th><th className="px-4 py-2.5 font-medium">Per extra kg</th><th className="px-4 py-2.5 font-medium">Time</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deliveryZones.map((z) => (
              <tr key={z.id}>
                <td className="px-4 py-2.5 font-medium text-navy-900">{z.name}</td>
                <td className="px-4 py-2.5">{formatNaira(z.baseKobo)}</td>
                <td className="px-4 py-2.5">{formatNaira(z.perKgKobo)}</td>
                <td className="px-4 py-2.5">{z.days[0]}–{z.days[1]} working days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Pickup hubs</h2>
      <ul>
        {pickupPoints.map((p) => (
          <li key={p.id}><strong>{p.name}</strong>, {p.address} ({p.feeKobo ? formatNaira(p.feeKobo) : "free"})</li>
        ))}
      </ul>
    </ContentPage>
  );
}
