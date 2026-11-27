import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/store/content-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "The terms that apply when you shop on Alaba.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <ContentPage title="Terms and conditions" updated="22 November 2026">
      <p>These terms apply when you use {site.url.replace("https://", "")} and buy from Alaba. By placing an order you agree to them.</p>
      <h2>Prices and payment</h2>
      <ul>
        <li>All prices are in Nigerian naira. Item prices are fixed when you pay.</li>
        <li>Shipping for imported items is an estimate until weighed. Any increase needs your approval; any decrease is refunded.</li>
        <li>Payments are processed by Paystack. Alaba does not store card details.</li>
      </ul>
      <h2>Delivery</h2>
      <p>Delivery times are estimates. Risk passes to you when the order is delivered or collected.</p>
      <h2>Cancellations and refunds</h2>
      <p>See our <Link href="/refund-policy">refund and cancellation policy</Link>.</p>
      <h2>Accounts</h2>
      <p>Keep your login details private. You&apos;re responsible for orders placed from your account.</p>
      <h2>Contact</h2>
      <p>Questions about these terms: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </ContentPage>
  );
}
