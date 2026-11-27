"use client";

import { ChevronLeft, CreditCard, Loader2, Lock, MapPin, Package, ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";
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
import { maxRedeemKobo } from "@/lib/loyalty";
import { lineTotalKobo, quote, type DeliveryChoice } from "@/lib/pricing";
import { CarrierMark } from "@/components/store/carrier-mark";
import type { Carrier } from "@/lib/data/settings";
import { whatsappLink } from "@/lib/site";
import { toQuoteLines, useCart } from "@/lib/store/cart";
import type { CarrierId, PaymentProvider } from "@/lib/types";
import { cn, formatNaira } from "@/lib/utils";
import { placeOrder } from "./actions";

type Form = {
  email: string;
  phone: string;
  name: string;
  method: "door" | "pickup";
  carrier: CarrierId;
  address: string;
  city: string;
  state: string;
  pickupId: string;
  provider: PaymentProvider;
  whatsapp: boolean;
  usePoints: boolean;
};

const DRAFT_KEY = "alaba-checkout-draft";
const empty: Form = { email: "", phone: "", name: "", method: "door", carrier: "gig", address: "", city: "", state: "", pickupId: "", provider: "paystack", whatsapp: true, usePoints: false };

function readDraft(): Form {
  if (typeof window === "undefined") return empty;
  try {
    return { ...empty, ...JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}") };
  } catch {
    return empty;
  }
}

const providers: { id: PaymentProvider; name: string; body: string }[] = [{ id: "paystack", name: "Paystack", body: "Card, bank transfer, USSD, Opay" }];

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

type Pickup = { id: string; name: string; address: string; state: string; feeKobo: number };

export function CheckoutForm({ states, pickupPoints, carriers, points }: { states: string[]; pickupPoints: Pickup[]; carriers: Carrier[]; points: number }) {
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
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_400px]">
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

  const pickupState = pickupPoints.find((p) => p.id === form.pickupId)?.state;
  const destState = form.method === "pickup" ? pickupState : form.state || undefined;
  const delivery: DeliveryChoice | null = destState ? { state: destState, carrier: form.carrier, method: form.method } : null;
  const itemsKobo = lines.reduce((s, l) => s + lineTotalKobo(l), 0);
  const redeemable = maxRedeemKobo(points, itemsKobo);
  const q = quote(toQuoteLines(lines), delivery, coupon, form.usePoints ? redeemable : 0);
  const fulfilment = delivery;
  const carrier = carriers.find((c) => c.id === form.carrier)!;
  const chooseCarrier = (id: CarrierId) => {
    setForm((f) => ({ ...f, carrier: id, method: carriers.find((c) => c.id === id)!.methods.includes(f.method) ? f.method : "door" }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await placeOrder({
        ...form,
        coupon: coupon?.code ?? null,
        lines: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
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
    <div className="container-page py-6 pb-28 sm:py-8 lg:pb-8">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-navy-900">
        <ChevronLeft className="size-4" aria-hidden /> Back to cart
      </Link>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Checkout</h1>

      <form id="checkout-form" ref={formRef} onSubmit={submit} noValidate className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
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
            <fieldset className="mb-5">
              <legend className="mb-2 text-sm font-medium">Choose your courier</legend>
              <div role="radiogroup" className="grid grid-cols-2 gap-3">
                {carriers.filter((c) => c.active).map((c) => (
                  <label key={c.id} className={cn("grid cursor-pointer gap-2 rounded-lg border p-3 transition-colors sm:p-4", form.carrier === c.id ? "border-navy-900 ring-1 ring-navy-900" : "border-gray-300 hover:border-gray-400")}>
                    <input type="radio" name="carrier" className="sr-only" checked={form.carrier === c.id} onChange={() => chooseCarrier(c.id)} />
                    <CarrierMark id={c.id} name={c.name} short={c.short} logo={c.logo} />
                    <span>
                      <span className="block text-sm font-semibold">{c.name}</span>
                      <span className="text-xs text-gray-600">{c.methods.includes("pickup") ? "Door or pickup station" : "Door delivery"} · {c.rates.sameState.days[0]}–{c.rates.national.days[1]} days</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div role="radiogroup" aria-label="Delivery method" className="mb-5 grid grid-cols-2 gap-3">
              {[
                { v: "door" as const, icon: Truck, title: "Doorstep delivery", body: "Anywhere in Nigeria" },
                { v: "pickup" as const, icon: Store, title: "Pickup station", body: carrier.methods.includes("pickup") ? `${Math.round(carrier.pickupDiscount * 100)}% cheaper` : "Jumia only" },
              ].map((o) => {
                const disabled = !carrier.methods.includes(o.v);
                return (
                  <label key={o.v} className={cn("flex items-start gap-2.5 rounded-lg border p-3 transition-colors sm:gap-3 sm:p-4", disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer", form.method === o.v ? "border-navy-900 ring-1 ring-navy-900" : "border-gray-300 hover:border-gray-400")}>
                    <input type="radio" name="method" className="sr-only" disabled={disabled} checked={form.method === o.v} onChange={() => set("method", o.v)} />
                    <o.icon className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden />
                    <span>
                      <span className="block text-sm font-semibold">{o.title}</span>
                      <span className="text-xs text-gray-600">{o.body}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            {form.method === "door" ? (
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
                <legend className="sr-only">Pickup station</legend>
                <div className="grid gap-2">
                  {pickupPoints.map((p) => (
                    <label key={p.id} className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-4", form.pickupId === p.id ? "border-navy-900 ring-1 ring-navy-900" : "border-gray-300 hover:border-gray-400")}>
                      <input type="radio" name="pickup" className="mt-1 size-4 accent-navy-900" checked={form.pickupId === p.id} onChange={() => set("pickupId", p.id)} />
                      <MapPin className="mt-0.5 size-4.5 shrink-0 text-brand-600" aria-hidden />
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{p.name}</span>
                        <span className="text-sm text-gray-600">{p.address}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {err("pickupId") && <p id="pickupId-error" role="alert" className="mt-2 text-sm text-red-600">{err("pickupId")}</p>}
              </fieldset>
            )}

            {q.stores.length > 0 && (
              <div className="mt-5 grid gap-2 rounded-lg bg-gray-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Package className="size-4 text-brand-600" aria-hidden />
                  {q.stores.length === 1 ? "1 shipment" : `${q.stores.length} shipments`}
                  {q.stores.length > 1 && <span className="font-normal text-gray-600">· items come from different sellers</span>}
                </p>
                <ul className="grid gap-1.5 text-sm">
                  {q.stores.map((s) => (
                    <li key={s.storeId} className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate">{s.storeName}</span>
                        <span className="text-xs text-gray-500">
                          {s.days ? `${s.days[0]}–${s.days[1]} days with ${carrier.short}` : "Choose a delivery address to see the price"}
                          {s.reason ? ` · ${s.reason}` : ""}
                        </span>
                      </span>
                      <span className={cn("shrink-0 font-medium tabular-nums", s.free && "text-green-700")}>
                        {fulfilment ? (s.free ? "Free" : formatNaira(s.deliveryKobo)) : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Step>

          <Step n={3} title="Payment">
            <div role="radiogroup" aria-label="Payment provider" className="grid gap-3">
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
            {redeemable > 0 && (
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 text-sm">
                <Checkbox className="mt-0.5" checked={form.usePoints} onChange={(e) => set("usePoints", e.target.checked)} />
                <span>
                  <span className="font-medium">Use {Math.round(redeemable / 100).toLocaleString()} Alaba points</span>
                  <span className="block text-gray-600">Save {formatNaira(redeemable)} · you have {points.toLocaleString()} points</span>
                </span>
              </label>
            )}
            <p className="mt-4 flex items-start gap-2.5 rounded-lg bg-brand-50 p-3 text-sm text-navy-900">
              <ShieldCheck className="mt-0.5 size-4.5 shrink-0 text-brand-600" aria-hidden />
              <span>
                <strong className="font-semibold">Alaba Buyer Protection.</strong> Sellers are paid only after you confirm delivery. Never pay a seller directly, by transfer or outside Alaba.
              </span>
            </p>
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
                <span className="font-medium tabular-nums">{formatNaira(lineTotalKobo(l))}</span>
              </li>
            ))}
          </ul>
          <SummaryRows q={q} deliveryKnown={!!fulfilment} />
          <Button type="submit" variant="accent" size="lg" className="w-full" loading={pending} loadingText="Connecting to Paystack…">
            <Lock className="size-4" aria-hidden />
            Pay {formatNaira(q.totalKobo)}
          </Button>
          <p className="text-center text-xs leading-relaxed text-gray-500">
            Demo mode: no real payment is taken. By paying you agree to our <Link href="/terms" className="underline">terms</Link> and{" "}
            <Link href="/refund-policy" className="underline">refund policy</Link>.
          </p>
          <a href={whatsappLink("Hi Alaba, I need help with checkout")} target="_blank" rel="noopener noreferrer" className="text-center text-sm font-medium text-brand-600 hover:underline">
            Stuck? Chat with us on WhatsApp
          </a>
        </Card>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3 pb-safe lg:hidden">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-semibold tabular-nums">{formatNaira(q.totalKobo)}</p>
        </div>
        <Button type="submit" form="checkout-form" variant="accent" className="ml-auto flex-1" loading={pending} loadingText="Connecting…">
          <Lock className="size-4" aria-hidden /> Pay now
        </Button>
      </div>

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
