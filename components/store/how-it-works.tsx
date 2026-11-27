import { CreditCard, PackageCheck, Search, Truck } from "lucide-react";

const steps = [
  { icon: Search, title: "Find it direct", body: "Shop manufacturers, vendors and Alaba's own imports. Prices in naira, delivery shown before you pay." },
  { icon: CreditCard, title: "Pay securely", body: "Card, bank transfer or USSD through Paystack. Sellers are paid only after you confirm delivery." },
  { icon: Truck, title: "Seller ships", body: "Each seller ships with GIG Logistics or Jumia Delivery, your choice. Track every parcel." },
  { icon: PackageCheck, title: "Confirm & done", body: "Confirm delivery and the seller is paid. Something wrong? Report it and we step in." },
];

export function HowItWorksSteps() {
  return (
    <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map(({ icon: Icon, title, body }, i) => (
        <li key={title} className="relative rounded-card border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-navy-900 text-white">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="text-sm font-medium text-orange-600">Step {i + 1}</span>
          </div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">{body}</p>
        </li>
      ))}
    </ol>
  );
}
