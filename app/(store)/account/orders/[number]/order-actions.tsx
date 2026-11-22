"use client";

import { AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { whatsappLink } from "@/lib/site";
import { formatNaira } from "@/lib/utils";

export function BalanceApproval({ number, balanceKobo, note }: { number: string; balanceKobo: number; note?: string }) {
  const [paid, setPaid] = useState(false);
  const [pending, start] = useTransition();

  if (paid) {
    return (
      <div className="flex gap-3 rounded-card border border-green-300 bg-green-50 p-5 text-green-900">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">Balance paid. Thank you!</p>
          <p className="text-sm">Your item goes on the next flight to Lagos. We&apos;ll message you when it departs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-card border-2 border-orange-500 bg-orange-50 p-5">
      <div className="flex gap-3">
        <AlertTriangle className="size-5 shrink-0 text-orange-600" aria-hidden />
        <div className="grid gap-1">
          <p className="font-semibold">Approve shipping balance: {formatNaira(balanceKobo)}</p>
          <p className="text-sm text-gray-700">
            {note ?? "Your item weighed more than the supplier's estimate."} Nothing has been charged. Choose how you&apos;d like to continue.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant="accent"
          loading={pending}
          loadingText="Opening payment…"
          onClick={() =>
            start(async () => {
              await new Promise((r) => setTimeout(r, 900));
              setPaid(true);
              toast.success(`Balance for ${number} paid`);
            })
          }
        >
          <Lock className="size-4" aria-hidden /> Approve and pay
        </Button>
        <a href={whatsappLink(`Hi Shupzy, question about the shipping balance on ${number}`)} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-lg border border-gray-300 bg-white px-5 font-medium hover:border-navy-900">
          Ask a question
        </a>
      </div>
    </div>
  );
}

export function RequestHelp({ number, canCancel }: { number: string; canCancel: boolean }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(canCancel ? "cancel" : "refund");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>{canCancel ? "Cancel or report a problem" : "Report a problem"}</Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={`Help with ${number}`}
        footer={
          <Button
            className="w-full"
            loading={pending}
            onClick={() => {
              if (reason.trim().length < 10) {
                setError("Tell us a little more (at least 10 characters) so we can help quickly.");
                return;
              }
              start(async () => {
                await new Promise((r) => setTimeout(r, 700));
                setOpen(false);
                setReason("");
                toast.success("Request sent", { description: "Our team replies within 2 working hours. You'll get an email too." });
              });
            }}
          >
            Send request
          </Button>
        }
      >
        <div className="grid gap-4">
          <Field label="What do you need?" htmlFor="req-type">
            <Select id="req-type" value={type} onChange={(e) => setType(e.target.value)}>
              {canCancel && <option value="cancel">Cancel my order (full refund before supplier purchase)</option>}
              <option value="refund">Request a refund</option>
              <option value="damaged">Item arrived damaged</option>
              <option value="missing">Item missing from my order</option>
              <option value="wrong">Wrong item received</option>
              <option value="delay">Order is delayed</option>
            </Select>
          </Field>
          <Field label="Details" htmlFor="req-reason" error={error} hint="Photos can be sent on WhatsApp after you submit.">
            <Textarea id="req-reason" value={reason} onChange={(e) => { setReason(e.target.value); setError(""); }} aria-invalid={!!error || undefined} />
          </Field>
          {!canCancel && (
            <p className="text-sm text-gray-600">This order has already been bought from the supplier, so cancellation follows our refund policy. We&apos;ll explain your options before anything changes.</p>
          )}
        </div>
      </Sheet>
    </>
  );
}
