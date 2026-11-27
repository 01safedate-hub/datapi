import type { Metadata } from "next";
import { carriers, nigerianStates, pickupPoints } from "@/lib/data/settings";
import { balance, ledger } from "@/lib/loyalty";
import { getMyOrders } from "@/lib/orders";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function CheckoutPage() {
  return <CheckoutForm states={nigerianStates} pickupPoints={pickupPoints} carriers={carriers} points={balance(ledger(getMyOrders())).available} />;
}
