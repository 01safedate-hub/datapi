import { BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/misc";
import { BrandForm } from "./brand-form";

export const metadata: Metadata = {
  title: "Register your brand",
  description: "Brand owners and authorised distributors: register an official brand on Alaba to protect your listings.",
  alternates: { canonical: "/brands/register" },
};

export default function RegisterBrandPage() {
  return (
    <div className="container-page max-w-2xl py-6 sm:py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: "Register" }]} />
      <h1 className="mt-4 flex items-center gap-2 text-3xl font-semibold"><BadgeCheck className="size-7 text-brand-600" aria-hidden />Register your brand</h1>
      <ul className="mt-3 grid gap-1.5 text-gray-600">
        <li>• An “Official brand” badge on your products and a brand page.</li>
        <li>• Control over who can list your brand, and fast takedown of fakes.</li>
        <li>• We review applications within 3 working days.</li>
      </ul>
      <BrandForm />
    </div>
  );
}
