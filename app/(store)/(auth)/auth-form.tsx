"use client";

import { Eye, EyeOff, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Card } from "@/components/ui/misc";

type Mode = "login" | "register" | "forgot" | "reset";

const copy: Record<Mode, { title: string; sub: string; cta: string }> = {
  login: { title: "Welcome back", sub: "Log in to track orders and check out faster.", cta: "Log in" },
  register: { title: "Create your account", sub: "Save addresses, track every order and get member-only deals.", cta: "Create account" },
  forgot: { title: "Reset your password", sub: "Enter your email and we'll send you a reset link.", cta: "Send reset link" },
  reset: { title: "Choose a new password", sub: "Use at least 8 characters.", cta: "Save new password" },
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next")?.startsWith("/") ? params.get("next")! : "/account";
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();
  const c = copy[mode];

  function validate() {
    const e: Record<string, string> = {};
    if (mode !== "reset" && !/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter a valid email address";
    if (mode === "register" && name.trim().length < 2) e.name = "Enter your name";
    if ((mode === "register" || mode === "reset") && password.length < 8) e.password = "Use at least 8 characters";
    if (mode === "login" && !password) e.password = "Enter your password";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    start(async () => {
      await new Promise((r) => setTimeout(r, 600)); // Demo: Supabase Auth call goes here.
      if (mode === "forgot") {
        setSent(true);
        return;
      }
      toast.success(mode === "register" ? "Account created. Welcome to Alaba!" : mode === "reset" ? "Password updated" : "Logged in");
      router.push(mode === "reset" ? "/login" : next);
    });
  }

  if (sent) {
    return (
      <Card className="mx-auto mt-10 max-w-md p-8 text-center">
        <Mail className="mx-auto size-10 text-brand-600" aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold">Check your email</h1>
        <p className="mt-2 text-gray-600">If an account exists for <strong>{email}</strong>, a reset link is on its way. It expires in 1 hour.</p>
        <p className="mt-6 text-sm text-gray-600">
          No email? Check spam, or{" "}
          <button type="button" className="font-medium text-brand-600 hover:underline" onClick={() => setSent(false)}>try again</button>.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto mt-10 max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-semibold">{c.title}</h1>
      <p className="mt-1 text-gray-600">{c.sub}</p>

      {(mode === "login" || mode === "register") && (
        <>
          <Button variant="outline" className="mt-6 w-full" onClick={() => toast.info("Google sign-in connects when Supabase Auth is configured.")}>
            <GoogleIcon /> Continue with Google
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-gray-500">
            <span className="h-px flex-1 bg-gray-200" /> or with email <span className="h-px flex-1 bg-gray-200" />
          </div>
        </>
      )}

      <form onSubmit={submit} noValidate className={mode === "forgot" || mode === "reset" ? "mt-6 grid gap-4" : "grid gap-4"}>
        {mode === "register" && (
          <Field label="Full name" htmlFor="name" error={errors.name}>
            <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name || undefined} />
          </Field>
        )}
        {mode !== "reset" && (
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input id="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email || undefined} />
          </Field>
        )}
        {mode !== "forgot" && (
          <Field
            label={mode === "reset" ? "New password" : "Password"}
            htmlFor="password"
            error={errors.password}
            hint={mode === "register" ? "At least 8 characters" : undefined}
          >
            <div className="relative">
              <Input
                id="password"
                type={show ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password || undefined}
                className="pr-11"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-gray-500 hover:bg-gray-100" aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
              </button>
            </div>
          </Field>
        )}
        {mode === "login" && (
          <Link href="/forgot-password" className="-mt-1 justify-self-end text-sm text-brand-600 hover:underline">Forgot password?</Link>
        )}
        <Button type="submit" size="lg" className="mt-1 w-full" loading={pending}>{c.cta}</Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {mode === "login" ? (
          <>New to Alaba? <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-medium text-brand-600 hover:underline">Create an account</Link></>
        ) : mode === "register" ? (
          <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-brand-600 hover:underline">Log in</Link></>
        ) : (
          <Link href="/login" className="font-medium text-brand-600 hover:underline">Back to log in</Link>
        )}
      </p>
      {mode === "register" && (
        <p className="mt-4 text-center text-xs text-gray-500">
          By creating an account you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.
        </p>
      )}
    </Card>
  );
}
