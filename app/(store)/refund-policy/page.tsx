import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";

export const metadata: Metadata = {
  title: "Refund and cancellation policy",
  description: "When you can cancel, how refunds work, and what happens if a supplier, airline or courier lets us down.",
  alternates: { canonical: "/refund-policy" },
};

const rows = [
  ["Cancelled before we buy from the supplier", "Full refund", "Within 3 working days"],
  ["Supplier can't supply or raises the price", "Your choice: new price, alternative, or full refund", "Within 3 working days"],
  ["Cancelled after supplier purchase", "Refund minus supplier restocking fee, if any", "After the supplier accepts the return"],
  ["Item damaged, missing or wrong on arrival", "Replacement or full refund for that item", "Within 5 working days of confirming"],
  ["Shipment lost in transit", "Full refund including shipping", "Within 5 working days of confirming"],
  ["Shipping cost lower than estimate", "We refund the difference automatically", "When the item is weighed"],
];

export default function RefundPolicyPage() {
  return (
    <ContentPage title="Refund and cancellation policy" updated="22 November 2026" intro="Our rule: we never take extra money without your approval, and you're never stuck with something we got wrong.">
      <div className="overflow-x-auto rounded-card border border-gray-200">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr><th className="px-4 py-2.5 font-medium">Situation</th><th className="px-4 py-2.5 font-medium">What you get</th><th className="px-4 py-2.5 font-medium">When</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map(([a, b, c]) => (
              <tr key={a}><td className="px-4 py-3 font-medium text-navy-900">{a}</td><td className="px-4 py-3">{b}</td><td className="px-4 py-3">{c}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>How to request a refund</h2>
      <ul>
        <li>Open the order in your account and choose “Report a problem”, or message us on WhatsApp.</li>
        <li>Report damaged, missing or wrong items within 48 hours of delivery, with photos.</li>
        <li>Refunds go back to the original payment method. Bank processing can take a few extra days.</li>
      </ul>
      <h2>Shipping delays</h2>
      <p>Delivery windows are estimates. If an order is more than 10 days past its window, you can cancel undelivered items for a full refund.</p>
    </ContentPage>
  );
}
