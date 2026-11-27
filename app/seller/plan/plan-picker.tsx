"use client";

import { BadgeCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/misc";
import type { SubscriptionPlan } from "@/lib/data/settings";
import { cn, formatNaira } from "@/lib/utils";

export function PlanPicker({ plans, current: initial, used }: { plans: SubscriptionPlan[]; current: string; used: number }) {
  const [current, setCurrent] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [, start] = useTransition();
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {plans.map((p) => {
        const on = p.id === current;
        const tooSmall = p.listingCap != null && used > p.listingCap;
        return (
          <li key={p.id}>
            <Card className={cn("grid h-full content-start gap-3 p-5", on && "ring-2 ring-navy-900")}>
              <div className="flex items-center justify-between"><p className="font-semibold">{p.name}</p>{on && <Badge tone="navy">Current</Badge>}</div>
              <p className="text-2xl font-semibold tabular-nums">{p.priceKobo ? formatNaira(p.priceKobo) : "Free"}<span className="text-sm font-normal text-gray-500">{p.priceKobo ? "/mo" : ""}</span></p>
              <ul className="grid gap-1.5 text-sm">{p.features.map((f) => <li key={f} className="flex gap-2"><BadgeCheck className="size-4 shrink-0 text-brand-600" aria-hidden />{f}</li>)}</ul>
              {!on && (
                <Button
                  className="mt-auto"
                  variant={p.priceKobo ? "accent" : "outline"}
                  disabled={tooSmall}
                  loading={busy === p.id}
                  loadingText={p.priceKobo ? "Opening Paystack…" : "Switching…"}
                  onClick={() => {
                    setBusy(p.id);
                    start(async () => {
                      await new Promise((r) => setTimeout(r, 800));
                      setCurrent(p.id);
                      setBusy(null);
                      toast.success(`You're on ${p.name}`, { description: p.priceKobo ? "Billed monthly via Paystack. Cancel any time." : undefined });
                    });
                  }}
                >
                  {tooSmall ? `Archive ${used - p.listingCap!} listings first` : `Switch to ${p.name}`}
                </Button>
              )}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
