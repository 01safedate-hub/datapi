"use client";

import { CheckCircle2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { registerBrand, type BrandInput } from "@/app/(store)/sell/actions";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";

type Form = Omit<BrandInput, "agree" | "role"> & { role: "" | BrandInput["role"]; agree: boolean };

export function BrandForm() {
  const [f, setF] = useState<Form>({ brandName: "", owner: "", trademark: "", website: "", email: "", phone: "", role: "", agree: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    if (errors[k]) setErrors(({ [k]: _x, ...r }) => r);
  };
  const inv = (k: string) => ({ "aria-invalid": !!errors[k] || undefined });

  if (done) {
    return (
      <Card className="mt-8 grid justify-items-center gap-3 p-8 text-center">
        <CheckCircle2 className="size-10 text-green-600" aria-hidden />
        <h2 className="text-xl font-semibold">Thanks, we&apos;ve got it</h2>
        <p className="text-gray-600">Reference <strong className="font-mono">{done}</strong>. We&apos;ll email {f.email} if we need trademark documents.</p>
      </Card>
    );
  }

  return (
    <form
      ref={ref}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await registerBrand({ ...f, role: (f.role || undefined) as BrandInput["role"], agree: f.agree as true });
          if (!res.ok) {
            setErrors(res.fieldErrors ?? {});
            toast.error(res.message);
            requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
            return;
          }
          setDone(res.reference);
          toast.success("Brand application sent");
        });
      }}
    >
      <Card className="mt-8 grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <Field label="Brand name" htmlFor="brandName" error={errors.brandName}>
          <Input id="brandName" value={f.brandName} onChange={(e) => set("brandName", e.target.value)} {...inv("brandName")} />
        </Field>
        <Field label="Company that owns it" htmlFor="owner" error={errors.owner}>
          <Input id="owner" value={f.owner} onChange={(e) => set("owner", e.target.value)} autoComplete="organization" {...inv("owner")} />
        </Field>
        <Field label="Trademark number" htmlFor="trademark" error={errors.trademark} hint="Registration or application number">
          <Input id="trademark" value={f.trademark} onChange={(e) => set("trademark", e.target.value)} placeholder="e.g. NG/TM/O/2026/12345" {...inv("trademark")} />
        </Field>
        <Field label="You are the" htmlFor="role" error={errors.role}>
          <Select id="role" value={f.role} onChange={(e) => set("role", e.target.value as Form["role"])} {...inv("role")}>
            <option value="">Choose one</option>
            <option value="owner">Brand owner</option>
            <option value="distributor">Authorised distributor</option>
            <option value="agency">Agency acting for the brand</option>
          </Select>
        </Field>
        <Field label="Website" htmlFor="website" error={errors.website} optional>
          <Input id="website" type="url" inputMode="url" value={f.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" {...inv("website")} />
        </Field>
        <Field label="Phone" htmlFor="bphone" error={errors.phone}>
          <Input id="bphone" type="tel" inputMode="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} {...inv("phone")} />
        </Field>
        <Field label="Work email" htmlFor="bemail" error={errors.email} className="sm:col-span-2">
          <Input id="bemail" type="email" inputMode="email" value={f.email} onChange={(e) => set("email", e.target.value)} {...inv("email")} />
        </Field>
        <label className="flex cursor-pointer items-start gap-3 text-sm sm:col-span-2">
          <Checkbox className="mt-0.5" checked={f.agree} onChange={(e) => set("agree", e.target.checked)} {...inv("agree")} />
          <span>
            I confirm I&apos;m authorised to register this brand and can provide trademark proof.
            {errors.agree && <span role="alert" className="mt-1 block text-red-600">{errors.agree}</span>}
          </span>
        </label>
        <Button type="submit" variant="accent" size="lg" className="sm:col-span-2" loading={pending} loadingText="Sending…">Submit for review</Button>
      </Card>
    </form>
  );
}
