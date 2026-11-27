import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { platformDefaults } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Alaba Buyer Protection",
  description: "Pay on Alaba and the seller is only paid after you confirm delivery. How Alaba Buyer Protection works.",
  alternates: { canonical: "/buyer-protection" },
};

export default function BuyerProtectionPage() {
  const h = platformDefaults.buyerProtection;
  return (
    <ContentPage title="Alaba Buyer Protection" intro="Your money goes to Alaba, not the seller. Sellers are paid only after your order arrives as described.">
      <h2>How it works</h2>
      <ul>
        <li><strong>You pay Alaba</strong> through Paystack (card, bank transfer or USSD).</li>
        <li><strong>The seller ships</strong> with GIG Logistics or Jumia Delivery. You can track every shipment.</li>
        <li><strong>You confirm delivery</strong> in your account. If you don&apos;t confirm or report a problem within {h.autoConfirmHours} hours of delivery, it&apos;s confirmed automatically.</li>
        <li><strong>Alaba approves the payout</strong> to the seller. Until then, the money is held by Alaba.</li>
      </ul>
      <h2>If something goes wrong</h2>
      <p>Report a problem within {h.disputeWindowHours} hours of delivery: wrong item, damaged, missing parts or not as described. The seller&apos;s payout is frozen while our team reviews it, and you get a refund if the seller is at fault.</p>
      <h2>What isn&apos;t covered</h2>
      <ul>
        <li>Any payment made outside Alaba: bank transfers, cash, POS, crypto or other apps.</li>
        <li>Orders arranged on WhatsApp, Instagram, phone calls or in person.</li>
      </ul>
      <h2>Stay safe</h2>
      <p>
        Some scammers build trust over two or three normal orders, then ask you to pay them directly for a “discount”. Alaba will never ask you to pay a seller outside the app. Our chat hides phone numbers, emails and bank details automatically. If a seller asks you to pay them directly, report it from the chat.
      </p>
    </ContentPage>
  );
}
