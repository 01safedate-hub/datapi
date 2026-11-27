import { BadgeCheck, Banknote, Factory, MessageCircle, ShieldCheck, Store, Truck } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/misc";
import { platformDefaults, subscriptionPlans } from "@/lib/data/settings";
import { cn, formatNaira } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sell on Alaba",
  description: "Manufacturers and vendors: sell directly to buyers across Nigeria. Free to start, GIG and Jumia delivery, paid after delivery is confirmed.",
  alternates: { canonical: "/sell" },
};

const steps = [
  { icon: Store, title: "Apply in 5 minutes", body: "Tell us if you make or resell, add your CAC number and pick a plan." },
  { icon: BadgeCheck, title: "Get verified", body: "We check your business and ID, usually within 2 working days." },
  { icon: Truck, title: "List & ship", body: "Add products with variants and wholesale prices. Ship with GIG or Jumia." },
  { icon: Banknote, title: "Get paid", body: "Payouts are approved once the buyer confirms delivery." },
];

export default function SellPage() {
  return (
    <div>
      <section className="bg-navy-900 text-white">
        <div className="container-page grid gap-6 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div className="grid gap-4">
            <p className="text-sm font-medium text-orange-400">Sell on Alaba</p>
            <h1 className="text-3xl leading-tight font-semibold sm:text-5xl">Reach buyers across Nigeria, without the middlemen.</h1>
            <p className="max-w-xl text-white/80">Alaba connects manufacturers, importers and sellers directly with buyers in all 36 states. You keep more of every sale.</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/sell/apply" variant="accent" size="lg">Start selling</ButtonLink>
              <ButtonLink href="/brands/register" size="lg" className="border border-white/30 bg-transparent hover:bg-white/10">Register a brand</ButtonLink>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Factory, title: "Manufacturers", body: "You make products. Sell wholesale, take custom and private-label orders, show your capacity and MOQ." },
              { icon: Store, title: "Vendors & retailers", body: "You sell finished goods. List branded products with variants, stock and free-delivery options." },
            ].map((t) => (
              <div key={t.title} className="grid gap-2 rounded-card bg-white/5 p-5 ring-1 ring-white/10">
                <t.icon className="size-6 text-orange-400" aria-hidden />
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm text-white/75">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="grid content-start gap-2 rounded-card border border-gray-200 p-5">
              <span className="flex items-center gap-2 text-sm text-gray-500"><s.icon className="size-5 text-brand-600" aria-hidden />Step {i + 1}</span>
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-gray-600">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page pb-12">
        <h2 className="text-2xl font-semibold">Plans</h2>
        <p className="mt-1 text-gray-600">Commission from {Math.round(Math.min(...Object.values(platformDefaults.commission.byCategory), platformDefaults.commission.default) * 100)}% per sale on every plan. Upgrade or downgrade any time.</p>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {subscriptionPlans.map((p) => (
            <li key={p.id}>
              <Card className={cn("grid h-full content-start gap-4 p-6", p.id === "pro" && "ring-2 ring-orange-500")}>
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">{p.priceKobo ? formatNaira(p.priceKobo) : "Free"}<span className="text-sm font-normal text-gray-500">{p.priceKobo ? " / month" : ""}</span></p>
                  <p className="mt-1 text-sm text-gray-600">{p.listingCap ? `Up to ${p.listingCap} listings` : "Unlimited listings"}</p>
                </div>
                <ul className="grid gap-2 text-sm">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><BadgeCheck className="size-4 shrink-0 text-brand-600" aria-hidden />{f}</li>)}
                </ul>
                <ButtonLink href={`/sell/apply?plan=${p.id}`} variant={p.id === "pro" ? "accent" : "outline"} className="mt-auto">Choose {p.name}</ButtonLink>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page grid gap-4 pb-16 md:grid-cols-2">
        <Card className="flex gap-3 p-5">
          <ShieldCheck className="size-6 shrink-0 text-brand-600" aria-hidden />
          <div>
            <p className="font-semibold">Buyer Protection builds trust, and sales</p>
            <p className="text-sm text-gray-600">Buyers pay Alaba. We release your payout after delivery is confirmed, or automatically {platformDefaults.buyerProtection.autoConfirmHours} hours after delivery.</p>
          </div>
        </Card>
        <Card className="flex gap-3 p-5">
          <MessageCircle className="size-6 shrink-0 text-brand-600" aria-hidden />
          <div>
            <p className="font-semibold">Keep it on Alaba</p>
            <p className="text-sm text-gray-600">Chat with buyers in the app. Sharing phone numbers or asking for direct payment is blocked and can suspend your payouts.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
