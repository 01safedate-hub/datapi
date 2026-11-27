import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";

export const metadata: Metadata = {
  title: "About Alaba",
  description: "Alaba is a Nigerian marketplace inspired by Alaba International Market: buy direct from manufacturers, importers and sellers, with Buyer Protection.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <ContentPage title="About Alaba" intro="Named after Alaba International Market in Ojo, Lagos, one of the biggest markets in West Africa.">
      <p>
        Alaba brings the market online. Manufacturers, importers and trusted vendors sell directly to buyers across Nigeria, so fewer middlemen take a cut and both sides keep more.
      </p>
      <h2>What we believe</h2>
      <ul>
        <li><strong>Direct is better.</strong> Buy from the people who make or import the goods.</li>
        <li><strong>Trust is built in.</strong> Buyers pay Alaba, and sellers are paid only after delivery is confirmed.</li>
        <li><strong>Clear and fair.</strong> Prices in naira, delivery costs shown before you pay, and real people when you need help.</li>
      </ul>
      <h2>Who we serve</h2>
      <p>Shoppers, small business owners and resellers in all 36 states and the FCT, and the Nigerian manufacturers and sellers who supply them. Alaba also imports selected products from China itself, sold under Alaba Verified.</p>
    </ContentPage>
  );
}
