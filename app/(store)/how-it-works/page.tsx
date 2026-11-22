import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/store/content-page";
import { HowItWorksSteps } from "@/components/store/how-it-works";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How it works",
  description: "How Shupzy buys from Chinese suppliers, ships to Lagos and delivers to you — with the full price in naira before you pay.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <ContentPage title="How Shupzy works" intro="You shop in naira. We deal with suppliers, freight, customs and delivery.">
      <HowItWorksSteps />
      <h2>Imported products</h2>
      <p>
        When you pay, your order goes straight into our sourcing queue. We buy from a vetted supplier within 48 hours and the item is delivered to our warehouse in Guangzhou. There we check it for damage, photograph it and weigh it.
      </p>
      <p>
        Shipping is priced by <strong>chargeable weight</strong>: whichever is greater of the real weight and the package size (length × width × height ÷ 6,000). If it costs more than the estimate you paid, we ask you to approve the difference before it flies. We never charge without your OK. If it costs less, we refund the difference.
      </p>
      <h2>Local products</h2>
      <p>Items marked <strong>Local · Fast</strong> are already in our Lagos warehouse and ship within 24 hours.</p>
      <h2>Tracking</h2>
      <p>
        You&apos;ll get an email (and WhatsApp, if you opt in) at each step: supplier purchase, China warehouse, dispatch, arrival in Lagos, customs, out for delivery and delivered. You can also <Link href="/track">track any order</Link> without an account.
      </p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/shop" variant="accent">Start shopping</ButtonLink>
        <ButtonLink href="/shipping" variant="outline">Shipping rates</ButtonLink>
      </div>
    </ContentPage>
  );
}
