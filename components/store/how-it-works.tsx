import { CreditCard, PackageCheck, Plane, Search } from "lucide-react";

const steps = [
  { icon: Search, title: "Pick your products", body: "Every price is in naira, with estimated shipping shown before you add to cart." },
  { icon: CreditCard, title: "Pay securely", body: "Card, bank transfer or USSD through Paystack or Flutterwave." },
  { icon: Plane, title: "We buy and ship", body: "We order from the supplier, check and weigh it in China, then fly it to Lagos." },
  { icon: PackageCheck, title: "Delivered to you", body: "Doorstep delivery anywhere in Nigeria, or free pickup at a Shupzy hub." },
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
