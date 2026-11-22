import type { Metadata } from "next";
import { demoCustomer } from "@/lib/data/ops";
import { AccountNav } from "./account-nav";

export const metadata: Metadata = {
  title: { default: "My account", template: "%s · My account · Shupzy" },
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-6">
        <p className="text-sm text-gray-500">Signed in as {demoCustomer.email}</p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Hi, {demoCustomer.name.split(" ")[0]}</h1>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
