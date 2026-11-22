import type { Metadata } from "next";
import { nigerianStates, pickupPoints } from "@/lib/data/settings";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return <CheckoutForm states={nigerianStates} pickupPoints={pickupPoints} />;
}
