"use client";

import { ChevronLeft, CreditCard, Loader2, Lock, MapPin, ShoppingBag, Store, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { SummaryRows } from "@/components/store/order-summary";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Card, EmptyState, Skeleton } from "@/components/ui/misc";
import { useHydrated } from "@/lib/hooks";
import { quote, type Fulfilment } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";
import { useCart } from "@/lib/store/cart";
import type { PaymentProvider } from "@/lib/types";
import { cn, formatNaira } from "@/lib/utils";
import { placeOrder } from "./actions";

type Form = {
  email: string;
  phone: string;
  name: string;
  method: "delivery" | "pickup";
  address: string;
  city: string;
  state: string;
  pickupId: string;
  provider: PaymentProvider;
  whatsapp: boolean;
};

const DRAFT_KEY = "shupzy-checkout-draft";
const empty: Form = { email: "", phone: "", name: "", method: "delivery", address: "", city: "", state: "", pickupId: "", provider: "paystack", whatsapp: true };

function readDraft(): Form {
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}") };
  } catch {
    return empty;
  }
}

const providers: { id: PaymentProvider; name: string; body: string }[] = [
  { id: "paystack", name: "Paystack", body: "Card, bank transfer, USSD" },
  { id: "flutterwave", name: "Flutterwave", body: "Card, bank transfer, USSD, OPay" },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-5 flex items-center gap-3 text-lg font-semibold">
        <span className="grid size-7 place-items-center rounded-full bg-navy-900 text-sm text-white">{n}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

export function CheckoutForm({ states, pickupPoints }: { states: string[]; pickupPoints: { id: string; name: string; address: string; feeKobo: number }[] }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const clear = useCart((s) => s.clear);
  const [form, setForm] = useState<Form>(readDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Persist the draft so nobody has to retype after a refresh or a dropped connection.
  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  if (!hydrated) {
    return (
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_400px]">
        <Skeleton className="h-[32rem]" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container-page py-8">
        <EmptyState icon={ShoppingBag} title="Nothing to check out yet" description="Your cart is empty. Add a product to continue." action={<ButtonLink href="/shop" variant="accent">Browse products</ButtonLink>} />
      </div>
    );
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _drop, ...rest }) => rest);
  };

  const fulfilment: Fulfilment | null =
    form.method === "pickup" ? (form.pickupId ? { method: "pickup", pickupId: form.pickupId } : null) : form.state ? { method: "delivery", state: form.state } : null;
  const q = quote(lines, fulfilment, coupon);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await placeOrder({
        ...form,
        coupon: coupon?.code ?? null,
        lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, options: l.options })),
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.message);
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
        return;
      }
      sessionStorage.removeItem(DRAFT_KEY);
      toast.dismiss();
      clear();
      router.replace(`/checkout/success?order=${res.orderNumber}&total=${res.totalKobo}&email=${encodeURIComponent(form.email)}`);
    });
  }

  const err = (k: string) => errors[k];
  const inv = (k: string) => ({ "aria-invalid": !!errors[k] || undefined, "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <div className="container-page py-6 sm:py-8">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-navy-900">
        <ChevronLeft className="size-4" aria-hidden /> Back to cart
      </Link>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Checkout</h1>

      <form ref={formRef} onSubmit={submit} noValidate className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        <div className="grid gap-5">
          <Step n={1} title="Contact">
            <p className="-mt-2 mb-5 text-sm text-gray-600">
              Checking out as a guest. <Link href="/login?next=/checkout" className="font-medium text-brand-600 hover:underline">Log in</Link> to use saved addresses.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" error={err("email")} hint="For your receipt and tracking updates" className="sm:col-span-2">
                <Input id="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} {...inv("email")} />
              </Field>
              <Field label="Full name" htmlFor="name" error={err("name")}>
                <Input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} {...inv("name")} />
              </Field>
              <Field label="Phone number" htmlFor="phone" error={err("phone")}>
                <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="0803 123 4567" value={form.phone} onChange={(e) => set("phone", e.target.value)} {...inv("phone")} />
              </Field>
            </div>
          </Step>

          <Step n={2} title="Delivery">
            <div role="radiogroup" aria-label="Delivery method" className="mb-5 grid grid-cols-2 gap-3">
              {[
                { v: "delivery" as const, icon: Truck, title: "Doorstep delivery", body: "Anywhere in Nigeria" },
                { v: "pickup" as const, icon: Store, title: "Pickup hub", body: "Free in Lagos" },
              ].map((o) => (
                <label key={o.v} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors", form.method === o.v ? "border-navy-900 ring-1 ring-navy-900" : "border-gray-300 hover:border-gray-400")}>
                  <input type="radio" name="method" className="sr-only" checked={form.method === o.v} onChange={() => set("method", o.v)} />
                  <o.icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                  <span>
                    <span className="block text-sm font-semibold">{o.title}</span>
                    <span className="text-xs text-gray-600">{o.body}</span>
                  </span>
                </label>
              ))}
            </div>

            {form.method === "delivery" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Street address" htmlFor="address" error={err("address")} className="sm:col-span-2">
                  <Input id="address" autoComplete="street-address" placeholder="House number and street" value={form.address} onChange={(e) => set("address", e.target.value)} {...inv("address")} />
                </Field>
                <Field label="City / area" htmlFor="city" error={err("city")}>
                  <Input id="city" autoComplete="address-level2" placeholder="e.g. Ikeja" value={form.city} onChange={(e) => set("city", e.target.value)} {...inv("city")} />
                </Field>
                <Field label="State" htmlFor="state" error={err("state")}>
                  <Select id="state" autoComplete="address-level1" value={form.state} onChange={(e) => set("state", e.target.value)} {...inv("state")}>
                    <option value="">Choose state</option>
                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </Field>
              </div>
            ) : (
              <fieldset>
                <legend className="sr-only">Pickup hub</legend>
                <div className="grid gap-2">
                  {pickupPoints.map((p) => (
                    <label key={p.id} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-4", form.pickupId === p.id ? "border-navy-900 ring-1 ring-navy-900" : "border-gray-300 hover:border-gray-400")}>
                      <input type="radio" name="pickup" className="mt-1 size-4 accent-navy-900" checked={form.pickupId === p.id} onChange={() => set("pickupId", p.id)} />
                      <MapPin className="mt-0.5 size-4.5 shrink-0 text-brand-600" aria-hidden />
                      <span className="flex-1">
                        <span className="flex justify-between gap-2 text-sm font-semibold">{p.name}<span className="font-medium">{p.feeKobo ? formatNaira(p.feeKobo) : "Free"}</span></span>
                        <span className="text-sm text-gray-600">{p.address}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {err("pickupId") && <p id="pickupId-error" role="alert" className="mt-2 text-sm text-red-600">{err("pickupId")}</p>}
              </fieldset>
            )}
          </Step>

          <Step n={3} title="Payment">
            <div role="radiogroup" aria-label="Payment provider" className="grid gap-3 sm:grid-cols-2">
              {providers.map((p) => (
                <label key={p.id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-4", form.provider === p.id ? "border-navy-900 ring-1 ring-navy-900" : "border-gray-300 hover:border-gray-400")}>
                  <input type="radio" name="provider" className="size-4 accent-navy-900" checked={form.provider === p.id} onChange={() => set("provider", p.id)} />
                  <CreditCard className="size-5 text-brand-600" aria-hidden />
                  <span>
                    <span className="block text-sm font-semibold">{p.name}</span>
                    <span className="text-xs text-gray-600">{p.body}</span>
                  </span>
                </label>
              ))}
            </div>
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
              <Checkbox className="mt-0.5" checked={form.whatsapp} onChange={(e) => set("whatsapp", e.target.checked)} />
              <span>Send order updates to my WhatsApp too <span className="block text-gray-500">Email updates are always on.</span></span>
            </label>
          </Step>
        </div>

        <Card className="grid gap-5 p-5 lg:sticky lg:top-36">
          <h2 className="text-lg font-semibold">Your order</h2>
          <ul className="grid max-h-64 gap-3 overflow-y-auto">
            {lines.map((l) => (
              <li key={l.key} className="flex items-center gap-3 text-sm">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  <Image src={l.image} alt="" fill sizes="48px" className="object-cover" />
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-navy-900 text-[11px] text-white">{l.quantity}</span>
                </span>
                <span className="line-clamp-2 flex-1">{l.name}</span>
                <span className="font-medium tabular-nums">{formatNaira(l.unitPriceKobo * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <SummaryRows q={q} deliveryKnown={!!fulfilment} />
          <Button type="submit" variant="accent" size="lg" className="w-full" loading={pending} loadingText={`Connecting to ${form.provider === "paystack" ? "Paystack" : "Flutterwave"}…`}>
            <Lock className="size-4" aria-hidden />
            Pay {formatNaira(q.totalKobo)}
          </Button>
          <p className="text-center text-xs leading-relaxed text-gray-500">
            Demo mode: no real payment is taken. By paying you agree to our <Link href="/terms" className="underline">terms</Link> and{" "}
            <Link href="/refund-policy" className="underline">refund policy</Link>.
          </p>
          <a href={whatsappLink("Hi Shupzy, I need help with checkout")} target="_blank" rel="noopener noreferrer" className="text-center text-sm font-medium text-brand-600 hover:underline">
            Stuck? Chat with us on WhatsApp
          </a>
        </Card>
      </form>

      {pending && (
        <div role="status" className="fixed inset-0 z-50 grid animate-fade-in place-items-center bg-white/80 backdrop-blur-sm">
          <div className="grid justify-items-center gap-3 text-center">
            <Loader2 className="size-8 animate-spin text-navy-900" aria-hidden />
            <p className="font-semibold">Securing your payment…</p>
            <p className="text-sm text-gray-600">Please don&apos;t close this page.</p>
          </div>
        </div>
      )}
    </div>
  );
}
