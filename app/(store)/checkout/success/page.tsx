import { CheckCircle2, Mail, MessageCircle, Package } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Callout, Card } from "@/components/ui/misc";
import type { SearchParams } from "@/lib/params";
import { formatNaira } from "@/lib/utils";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function SuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const order = typeof sp.order === "string" && /^ALB-\d{5}$/.test(sp.order) ? sp.order : null;
  const total = Number(sp.total);
  const email = typeof sp.email === "string" ? sp.email : null;

  return (
    <div className="container-page max-w-2xl py-10 sm:py-14">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-14 text-green-600" aria-hidden />
        <h1 className="mt-4 text-3xl font-semibold">Thank you, your order is placed</h1>
        {order && (
          <p className="mt-2 text-gray-600">
            Order <strong className="font-semibold text-navy-900">{order}</strong>
            {Number.isFinite(total) && total > 0 && <> · {formatNaira(total)} paid</>}
          </p>
        )}
      </div>

      <Card className="mt-8 grid gap-4 p-6">
        <h2 className="font-semibold">What happens next</h2>
        <ol className="grid gap-4 text-sm">
          <li className="flex gap-3">
            <Mail className="size-5 shrink-0 text-brand-600" aria-hidden />
            <span>A receipt is on its way to {email ? <strong>{email}</strong> : "your email"}.</span>
          </li>
          <li className="flex gap-3">
            <Package className="size-5 shrink-0 text-brand-600" aria-hidden />
            <span>Imported items are ordered from the supplier within 48 hours. Local items ship within 24 hours.</span>
          </li>
          <li className="flex gap-3">
            <MessageCircle className="size-5 shrink-0 text-brand-600" aria-hidden />
            <span>We&apos;ll update you by email and WhatsApp at every step, and ask before any extra charge.</span>
          </li>
        </ol>
      </Card>

      <Callout tone="orange" title="Save your details for next time" className="mt-6">
        Create an account with the same email to see this order, save addresses and check out faster.
      </Callout>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order && <ButtonLink href={`/track?order=${order}${email ? `&contact=${encodeURIComponent(email)}` : ""}`} variant="primary">Track this order</ButtonLink>}
        <ButtonLink href={`/register${email ? `?email=${encodeURIComponent(email)}` : ""}`} variant="accent">Create account</ButtonLink>
        <ButtonLink href="/shop" variant="outline">Keep shopping</ButtonLink>
      </div>
    </div>
  );
}
