import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ContentPage } from "@/components/store/content-page";
import { site, whatsappLink } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Reach Alaba on WhatsApp, email or phone. We reply fast.",
  alternates: { canonical: "/contact" },
};

const channels = [
  { icon: MessageCircle, label: "WhatsApp", value: "Fastest, under 10 minutes", href: whatsappLink("Hi Alaba") },
  { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
  { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
  { icon: MapPin, label: "Office", value: site.address },
  { icon: Clock, label: "Hours", value: "Mon–Sat, 8am–8pm WAT" },
];

export default function ContactPage() {
  return (
    <ContentPage title="Contact us" intro="Questions about a product or an order? We're here.">
      <ul className="grid gap-3 sm:grid-cols-2">
        {channels.map(({ icon: Icon, label, value, href }) => (
          <li key={label} className="flex items-start gap-3 rounded-card border border-gray-200 p-4">
            <Icon className="mt-0.5 size-5 text-brand-600" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-navy-900">{label}</p>
              {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm">{value}</a> : <p className="text-sm">{value}</p>}
            </div>
          </li>
        ))}
      </ul>
      <h2>Send us a message</h2>
      <ContactForm />
    </ContentPage>
  );
}
