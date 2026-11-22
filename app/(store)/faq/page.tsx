import { ChevronDown } from "lucide-react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ContentPage } from "@/components/store/content-page";
import { ButtonLink } from "@/components/ui/button";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about prices, shipping times, payments, customs, refunds and tracking on Shupzy.",
  alternates: { canonical: "/faq" },
};

const faqs = [
  { q: "Are prices final?", a: "The item price is final. For imported items, shipping is an estimate until we weigh your item in China. If it's higher, we ask before charging; if it's lower, we refund the difference." },
  { q: "How long does delivery take?", a: "Local items: 1–4 days. Imported items: usually 10–18 days to Lagos, then 1–6 days to your state." },
  { q: "How do I pay?", a: "Card, bank transfer or USSD through Paystack or Flutterwave. We never see or store your card details." },
  { q: "Do I pay customs separately?", a: "No. Customs clearance is included in the shipping estimate you see before paying." },
  { q: "Can I cancel?", a: "Yes, for a full refund, until we've bought from the supplier (usually within 48 hours). After that, our refund policy applies." },
  { q: "What if my item arrives damaged or wrong?", a: "Report it within 48 hours of delivery from your order page or on WhatsApp with photos. We'll replace or refund it." },
  { q: "Do I need an account?", a: "No. You can check out as a guest and track orders with your order number. An account saves addresses and shows all your orders in one place." },
  { q: "Do you deliver outside Lagos?", a: "Yes, to all 36 states and the FCT, or you can pick up at one of our hubs." },
];

export default function FaqPage() {
  return (
    <ContentPage title="Frequently asked questions">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <div className="divide-y divide-gray-200 rounded-card border border-gray-200">
        {faqs.map((f) => (
          <details key={f.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-navy-900">
              {f.q}
              <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-2 text-gray-700">{f.a}</p>
          </details>
        ))}
      </div>
      <div className="rounded-card bg-gray-50 p-5">
        <p className="font-medium text-navy-900">Still have a question?</p>
        <p className="mt-1 text-sm">We usually reply on WhatsApp in under 10 minutes.</p>
        <ButtonLink href={whatsappLink("Hi Shupzy, I have a question")} target="_blank" rel="noopener noreferrer" variant="accent" className="mt-4">Chat with us</ButtonLink>
      </div>
    </ContentPage>
  );
}
