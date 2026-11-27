import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal data Alaba collects, why, and your rights under the Nigeria Data Protection Act 2023.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy policy" updated="22 November 2026" intro="We collect only what we need to deliver your orders and support you.">
      <h2>What we collect</h2>
      <ul>
        <li>Contact details: name, email, phone number and delivery address.</li>
        <li>Order history and support messages.</li>
        <li>Payment confirmations from Paystack (never your full card number).</li>
        <li>Basic device and usage data to keep the site secure and fast.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To process, ship and deliver orders, and send updates by email and WhatsApp.</li>
        <li>To prevent fraud and meet legal and tax obligations.</li>
        <li>To send deals, only if you opt in. You can opt out at any time.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>Payment providers, shipping agents and couriers, only as needed to complete your order. We never sell personal data.</p>
      <h2>Your rights</h2>
      <p>Under the Nigeria Data Protection Act 2023 you can access, correct or delete your data. Email <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </ContentPage>
  );
}
