import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Shop",
    links: [
      ["All products", "/shop"],
      ["Manufacturers", "/manufacturers"],
      ["Brands", "/brands"],
      ["Imported by Alaba", "/shop?source=imported"],
      ["Wholesale deals", "/shop?wholesale=1"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Buyer Protection", "/buyer-protection"],
      ["How it works", "/how-it-works"],
      ["Shipping & delivery", "/shipping"],
      ["Track an order", "/track"],
      ["FAQ", "/faq"],
      ["Contact us", "/contact"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About Alaba", "/about"],
      ["Sell on Alaba", "/sell"],
      ["Register a brand", "/brands/register"],
      ["Refund & cancellation", "/refund-policy"],
      ["Terms", "/terms"],
      ["Privacy", "/privacy"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-20 bg-navy-900 pb-24 text-white/80 md:pb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="grid content-start gap-4">
          <div className="w-fit rounded-xl bg-white px-3 py-2">
            <Logo />
          </div>
          <p className="max-w-xs text-sm leading-relaxed">{site.tagline} Sellers are paid only after you confirm delivery.</p>
          <ul className="grid gap-2 text-sm">
            <li className="flex items-center gap-2"><Mail className="size-4 text-orange-500" aria-hidden /><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></li>
            <li className="flex items-center gap-2"><Phone className="size-4 text-orange-500" aria-hidden /><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white">{site.phone}</a></li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-orange-500" aria-hidden />{site.address}</li>
          </ul>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="mb-3 text-sm font-semibold text-white">{col.title}</h2>
            <ul className="grid gap-2 text-sm">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white hover:underline">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Alaba. All prices in Nigerian naira (₦).</p>
          <p>Secure payments by Paystack · Alaba Buyer Protection</p>
        </div>
      </div>
    </footer>
  );
}
