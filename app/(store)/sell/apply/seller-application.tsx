"use client";

import { CheckCircle2, Factory, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, ButtonLink } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Card, Skeleton } from "@/components/ui/misc";
import { useHydrated } from "@/lib/hooks";
import { cn, formatNaira } from "@/lib/utils";
import { applyAsSeller } from "../actions";

type Plan = { id: string; name: string; priceKobo: number; listingCap: number | null };
type Form = {
  type: "" | "manufacturer" | "vendor";
  businessName: string;
  cac: string;
  contactName: string;
  email: string;
  phone: string;
  state: string;
  city: string;
  categories: string[];
  plan: string;
  capacity: string;
  moq: string;
  customization: string[];
  agree: boolean;
};

const KEY = "alaba-seller-application";
const customOptions = ["Logo printing", "Custom colours", "Private-label packaging", "Custom sizes", "Made to order"];

type Props = { categories: { slug: string; name: string }[]; states: string[]; plans: Plan[]; initialPlan: string; initialType?: "manufacturer" | "vendor" };

/** Mount after hydration so the saved draft can be read without a mismatch. */
export function SellerApplication(props: Props) {
  return useHydrated() ? <ApplicationForm {...props} /> : <Skeleton className="mt-8 h-[40rem]" />;
}

function ApplicationForm({ categories, states, plans, initialPlan, initialType }: Props) {
  const [form, setForm] = useState<Form>(() => {
    const base: Form = { type: initialType ?? "", businessName: "", cac: "", contactName: "", email: "", phone: "", state: "", city: "", categories: [], plan: initialPlan, capacity: "", moq: "", customization: [], agree: false };
    if (typeof window === "undefined") return base;
    try {
      return { ...base, ...JSON.parse(localStorage.getItem(KEY) ?? "{}"), plan: initialPlan, agree: false };
    } catch {
      return base;
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const { agree: _a, ...draft } = form;
    localStorage.setItem(KEY, JSON.stringify(draft));
  }, [form]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _x, ...r }) => r);
  };
  const toggle = (k: "categories" | "customization", v: string) => set(k, form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v]);
  const inv = (k: string) => ({ "aria-invalid": !!errors[k] || undefined });

  if (done) {
    return (
      <Card className="mt-8 grid justify-items-center gap-3 p-8 text-center">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden />
        <h2 className="text-xl font-semibold">Application received</h2>
        <p className="max-w-md text-gray-600">
          Reference <strong className="font-mono">{done}</strong>. We&apos;ve emailed {form.email} with the documents we need (ID and proof of address). Most stores are approved within 2 working days.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/seller" variant="accent">Preview seller dashboard</ButtonLink>
          <Link href="/" className="inline-flex h-11 items-center rounded-lg border border-gray-300 px-5 font-medium hover:border-navy-900">Back to Alaba</Link>
        </div>
      </Card>
    );
  }

  return (
    <form
      ref={ref}
      noValidate
      className="mt-8 grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await applyAsSeller({ ...form, type: form.type || (undefined as never), agree: form.agree as true });
          if (!res.ok) {
            setErrors(res.fieldErrors ?? {});
            toast.error(res.message);
            requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
            return;
          }
          localStorage.removeItem(KEY);
          setDone(res.reference);
          toast.success("Application sent");
        });
      }}
    >
      <Card className="grid gap-4 p-5 sm:p-6">
        <h2 className="font-semibold">1. How do you sell?</h2>
        <div role="radiogroup" aria-label="Seller type" className="grid gap-3 sm:grid-cols-2">
          {[
            { v: "manufacturer" as const, icon: Factory, title: "I'm a manufacturer", body: "I make products. I sell in bulk and can take custom or private-label orders." },
            { v: "vendor" as const, icon: Store, title: "I'm a vendor / retailer", body: "I sell finished products (my own stock or brands I distribute)." },
          ].map((o) => (
            <label key={o.v} className={cn("flex cursor-pointer gap-3 rounded-lg border p-4", form.type === o.v ? "border-navy-900 ring-1 ring-navy-900" : errors.type ? "border-red-400" : "border-gray-300 hover:border-gray-400")}>
              <input type="radio" name="type" className="sr-only" checked={form.type === o.v} onChange={() => set("type", o.v)} {...inv("type")} />
              <o.icon className="mt-0.5 size-5 shrink-0 text-orange-500" aria-hidden />
              <span>
                <span className="block font-semibold">{o.title}</span>
                <span className="text-sm text-gray-600">{o.body}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.type && <p role="alert" className="text-sm text-red-600">{errors.type}</p>}
      </Card>

      <Card className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h2 className="font-semibold sm:col-span-2">2. Your business</h2>
        <Field label="Business name" htmlFor="businessName" error={errors.businessName}>
          <Input id="businessName" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} autoComplete="organization" {...inv("businessName")} />
        </Field>
        <Field label="CAC number" htmlFor="cac" error={errors.cac} hint="RC, BN or IT number">
          <Input id="cac" value={form.cac} onChange={(e) => set("cac", e.target.value.toUpperCase())} placeholder="RC 1234567" {...inv("cac")} />
        </Field>
        <Field label="Your full name" htmlFor="contactName" error={errors.contactName}>
          <Input id="contactName" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} autoComplete="name" {...inv("contactName")} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone}>
          <Input id="phone" type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="0803 123 4567" {...inv("phone")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email} className="sm:col-span-2">
          <Input id="email" type="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" {...inv("email")} />
        </Field>
        <Field label="State" htmlFor="state" error={errors.state}>
          <Select id="state" value={form.state} onChange={(e) => set("state", e.target.value)} {...inv("state")}>
            <option value="">Choose state</option>
            {states.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="City / area" htmlFor="city" error={errors.city} hint="Where your goods ship from">
          <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Ojo" {...inv("city")} />
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium">What do you sell?</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const on = form.categories.includes(c.slug);
              return (
                <button key={c.slug} type="button" aria-pressed={on} onClick={() => toggle("categories", c.slug)} className={cn("rounded-lg border px-3 py-1.5 text-sm", on ? "border-navy-900 bg-navy-900 text-white" : "border-gray-300 hover:border-navy-900")}>
                  {c.name}
                </button>
              );
            })}
          </div>
          {errors.categories && <p role="alert" className="mt-2 text-sm text-red-600">{errors.categories}</p>}
        </fieldset>
      </Card>

      {form.type === "manufacturer" && (
        <Card className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <h2 className="font-semibold sm:col-span-2">3. Manufacturing details</h2>
          <Field label="Monthly capacity" htmlFor="capacity" error={errors.capacity}>
            <Input id="capacity" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 5,000 pairs a month" {...inv("capacity")} />
          </Field>
          <Field label="Minimum bulk / custom order" htmlFor="moq" error={errors.moq}>
            <Input id="moq" value={form.moq} onChange={(e) => set("moq", e.target.value)} placeholder="e.g. 50 units" {...inv("moq")} />
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium">Customisation you offer <span className="font-normal text-gray-500">(optional)</span></legend>
            <div className="flex flex-wrap gap-2">
              {customOptions.map((c) => {
                const on = form.customization.includes(c);
                return (
                  <button key={c} type="button" aria-pressed={on} onClick={() => toggle("customization", c)} className={cn("rounded-lg border px-3 py-1.5 text-sm", on ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-300 hover:border-orange-500")}>
                    {c}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </Card>
      )}

      <Card className="grid gap-4 p-5 sm:p-6">
        <h2 className="font-semibold">{form.type === "manufacturer" ? "4" : "3"}. Plan</h2>
        <div role="radiogroup" aria-label="Plan" className="grid gap-3 sm:grid-cols-3">
          {plans.map((p) => (
            <label key={p.id} className={cn("grid cursor-pointer gap-0.5 rounded-lg border p-4", form.plan === p.id ? "border-navy-900 ring-1 ring-navy-900" : "border-gray-300 hover:border-gray-400")}>
              <input type="radio" name="plan" className="sr-only" checked={form.plan === p.id} onChange={() => set("plan", p.id)} />
              <span className="font-semibold">{p.name}</span>
              <span className="text-sm tabular-nums">{p.priceKobo ? `${formatNaira(p.priceKobo)}/mo` : "Free"}</span>
              <span className="text-xs text-gray-500">{p.listingCap ? `Up to ${p.listingCap} listings` : "Unlimited listings"}</span>
            </label>
          ))}
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <Checkbox className="mt-0.5" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} {...inv("agree")} />
          <span>
            I agree to the <Link href="/terms" className="font-medium text-brand-600 hover:underline">seller terms</Link>, including keeping all payments on Alaba. Payouts are released after buyers confirm delivery.
            {errors.agree && <span role="alert" className="mt-1 block text-red-600">{errors.agree}</span>}
          </span>
        </label>
        <Button type="submit" variant="accent" size="lg" loading={pending} loadingText="Sending application…">Submit application</Button>
      </Card>
    </form>
  );
}
