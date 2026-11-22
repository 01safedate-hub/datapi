import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";

export const metadata: Metadata = {
  title: "About Shupzy",
  description: "Shupzy makes buying from China simple for Nigerians: naira prices, transparent shipping and tracking to your door.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentPage title="About Shupzy" intro="Shopping from China shouldn't mean chasing suppliers, guessing costs or waiting in the dark.">
      <p>
        Shupzy is a Lagos-based store for imported and local products. We buy from vetted suppliers in China, ship by air to Nigeria, clear customs and deliver to your door, with everything priced in naira.
      </p>
      <h2>What we believe</h2>
      <ul>
        <li><strong>Clear prices.</strong> You see the item price and estimated shipping before you pay.</li>
        <li><strong>No surprise charges.</strong> If something changes, we ask first.</li>
        <li><strong>Always reachable.</strong> Real people on WhatsApp and email, six days a week.</li>
      </ul>
      <h2>Who we serve</h2>
      <p>Individual shoppers, small business owners and resellers across all 36 states and the FCT.</p>
    </ContentPage>
  );
}
