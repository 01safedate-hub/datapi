"use client";

import { CheckCircle2, PackageCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ConfirmDelivery({ number, storeName }: { number: string; storeName: string }) {
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();
  if (done) {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-green-700">
        <CheckCircle2 className="size-4" aria-hidden /> Confirmed. Thank you!
      </p>
    );
  }
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="accent"
        loading={pending}
        loadingText="Confirming…"
        onClick={() =>
          start(async () => {
            await new Promise((r) => setTimeout(r, 700));
            setDone(true);
            toast.success("Delivery confirmed", { description: `${storeName} will now be paid for ${number}.` });
          })
        }
      >
        <PackageCheck className="size-4" aria-hidden /> I received everything
      </Button>
      <a href={`/account/support?order=${number}`} className="inline-flex h-9 items-center rounded-lg border border-gray-300 px-3 text-sm font-medium hover:border-navy-900">
        Report a problem
      </a>
    </div>
  );
}
