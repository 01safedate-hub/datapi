"use client";

import { AlertTriangle, ArrowLeft, Flag, MessageCircle, Send, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { useHydrated } from "@/lib/hooks";
import { flagCopy, scanMessage, trustRisk } from "@/lib/scam";
import { useChat, type ChatMessage, type ChatThread } from "@/lib/store/chat";
import { cn, formatNaira } from "@/lib/utils";

type Role = "buyer" | "seller";

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
const day = (iso: string) => new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
const listFlags = (m: ChatMessage) => [...new Set(m.flags.map((f) => flagCopy[f.kind]))].join(", ");

function SafetyBanner({ thread, role }: { thread: ChatThread; role: Role }) {
  const elevated = trustRisk(thread.completedOrders) === "elevated";
  if (role === "seller") {
    return (
      <div className="flex gap-2.5 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-700">
        <ShieldCheck className="size-4 shrink-0 text-brand-600" aria-hidden />
        <p>Keep every sale on Alaba. Phone numbers, emails, links and bank details are hidden automatically, and repeated attempts suspend payouts.</p>
      </div>
    );
  }
  return (
    <div className={cn("grid gap-1 border-b px-4 py-3 text-xs", elevated ? "border-orange-200 bg-orange-50 text-orange-900" : "border-brand-50 bg-brand-50 text-navy-900")} role="note">
      <p className="flex items-center gap-2 font-semibold">
        {elevated ? <ShieldAlert className="size-4 shrink-0 text-orange-600" aria-hidden /> : <ShieldCheck className="size-4 shrink-0 text-brand-600" aria-hidden />}
        Pay only through Alaba to keep Buyer Protection
      </p>
      <p>
        Never pay by bank transfer, cash or another app, even for a discount. Alaba only pays the seller after you confirm delivery.
        {elevated && (
          <strong className="mt-1 block font-semibold">
            You&apos;ve ordered from {thread.storeName} {thread.completedOrders} times. Some sellers build trust over 2–3 orders, then ask for direct payment. If they do, report it.
          </strong>
        )}
      </p>
    </div>
  );
}

function Bubble({ m, role, storeName, onReport }: { m: ChatMessage; role: Role; storeName: string; onReport: () => void }) {
  if (m.from === "system") {
    if (!m.product) return null;
    return (
      <li className="mx-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-gray-200 bg-white p-2.5">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
          <Image src={m.product.image} alt="" fill sizes="48px" className="object-cover" />
        </span>
        <span className="min-w-0 text-sm">
          <span className="block text-xs text-gray-500">{role === "buyer" ? "You're asking about" : "Buyer is asking about"}</span>
          <Link href={`/p/${m.product.slug}`} className="line-clamp-1 font-medium hover:underline">{m.product.name}</Link>
          <span className="text-xs tabular-nums text-gray-600">{formatNaira(m.product.priceKobo)}</span>
        </span>
      </li>
    );
  }
  const mine = m.from === role;
  const flagged = m.flags.length > 0;
  return (
    <li className={cn("grid max-w-[85%] gap-1", mine ? "justify-self-end justify-items-end" : "justify-self-start")}>
      <p className={cn("rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words", mine ? "rounded-br-md bg-navy-900 text-white" : "rounded-bl-md bg-gray-100 text-gray-900", flagged && !mine && "ring-2 ring-red-300")}>
        {mine && m.original ? m.original : m.text}
      </p>
      {flagged && (
        <div className={cn("flex max-w-xs gap-1.5 rounded-lg px-2.5 py-1.5 text-xs", m.blocked ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900")} role="alert">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          <span>
            {mine
              ? m.blocked
                ? `Hidden from the ${role === "buyer" ? "seller" : "buyer"}: ${listFlags(m)} isn't allowed in chat.`
                : `Flagged: ${listFlags(m)}. Keep the conversation and payment on Alaba.`
              : role === "buyer"
                ? <>
                    {m.blocked ? `Alaba hid ${listFlags(m)} from this message.` : `This message mentions ${listFlags(m)}.`} {storeName} may be trying to take you off Alaba. Don&apos;t pay outside the app.{" "}
                    <button type="button" onClick={onReport} className="font-semibold underline">Report</button>
                  </>
                : `Alaba hid ${listFlags(m)} from this message.`}
          </span>
        </div>
      )}
      <span className="px-1 text-[11px] text-gray-400">{time(m.at)}</span>
    </li>
  );
}

function Thread({ thread, role, onBack }: { thread: ChatThread; role: Role; onBack: () => void }) {
  const send = useChat((s) => s.send);
  const markRead = useChat((s) => s.markRead);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLOListElement>(null);
  const live = useMemo(() => (text.trim().length > 5 ? scanMessage(text) : null), [text]);
  const other = role === "buyer" ? thread.storeName : thread.buyerName;

  useEffect(() => {
    markRead(thread.id, role);
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.messages.length, thread.id, role, markRead]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const msg = send(thread.id, role, text);
    if (!msg) return;
    setText("");
    if (msg.blocked) toast.warning("Part of your message was hidden", { description: `${listFlags(msg)} can't be shared in chat. Keep the order on Alaba.` });
    else if (msg.flags.length) toast.warning("Message sent with a safety flag", { description: "Payments outside Alaba aren't protected." });
  }

  const report = () => toast.success("Reported to Alaba Trust & Safety", { description: "We review reports within 2 hours. Don't send any money in the meantime." });

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label={`Chat with ${other}`}>
      <header className="flex items-center gap-3 border-b border-gray-200 px-3 py-2.5">
        <button type="button" onClick={onBack} className="grid size-9 place-items-center rounded-lg hover:bg-gray-100 md:hidden" aria-label="Back to conversations">
          <ArrowLeft className="size-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{other}</p>
          <p className="text-xs text-gray-500">{role === "buyer" ? "Usually replies within a few hours" : `${thread.completedOrders} completed orders with you`}</p>
        </div>
        {role === "buyer" && (
          <Button variant="ghost" size="sm" onClick={report}>
            <Flag className="size-4" aria-hidden /> Report
          </Button>
        )}
      </header>
      <SafetyBanner thread={thread} role={role} />
      <ol ref={listRef} className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {thread.messages.length === 0 && <li className="py-10 text-center text-sm text-gray-500">Say hello and ask about sizes, stock or bulk prices.</li>}
        {thread.messages.map((m, i) => (
          <Fragment key={m.id}>
            {(i === 0 || day(m.at) !== day(thread.messages[i - 1]!.at)) && (
              <li key={`d-${m.id}`} className="text-center text-[11px] text-gray-400">{day(m.at)}</li>
            )}
            <Bubble m={m} role={role} storeName={thread.storeName} onReport={report} />
          </Fragment>
        ))}
      </ol>
      <form onSubmit={submit} className="grid gap-2 border-t border-gray-200 p-3 pb-safe">
        {live?.flags.length ? (
          <p className="flex gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900" role="status">
            <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
            {live.blocked ? `This includes ${[...new Set(live.flags.map((f) => flagCopy[f.kind]))].join(", ")}. It will be hidden when sent.` : "Keep payment and contact on Alaba so your order stays protected."}
          </p>
        ) : null}
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">Message</label>
          <textarea
            id="chat-input"
            rows={1}
            value={text}
            maxLength={1000}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Write a message…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-gray-300 px-3.5 py-2.5 text-base outline-none focus:border-navy-900 sm:text-sm"
          />
          <Button type="submit" className="size-11 shrink-0 px-0" disabled={!text.trim()} aria-label="Send message">
            <Send className="size-4.5" aria-hidden />
          </Button>
        </div>
      </form>
    </section>
  );
}

export function ChatRoom({ role, initialThreadId, storeSlug }: { role: Role; initialThreadId?: string | null; storeSlug?: string }) {
  const hydrated = useHydrated();
  const all = useChat((s) => s.threads);
  const threads = useMemo(() => (storeSlug ? all.filter((t) => t.storeSlug === storeSlug) : all).toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [all, storeSlug]);
  // undefined = the user hasn't picked yet, so follow the thread we were opened with.
  const [picked, setActiveId] = useState<string | null | undefined>(undefined);
  const activeId = picked === undefined ? (initialThreadId ?? null) : picked;
  const active = threads.find((t) => t.id === activeId) ?? null;

  if (!hydrated) return <Skeleton className="h-[70dvh]" />;

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[28rem] overflow-hidden rounded-card border border-gray-200 bg-white md:h-[calc(100dvh-12rem)]">
      <aside className={cn("w-full shrink-0 flex-col border-r border-gray-200 md:flex md:w-80", active ? "hidden" : "flex")}>
        <h2 className="border-b border-gray-200 px-4 py-3 font-semibold">Messages</h2>
        {threads.length === 0 ? (
          <EmptyState icon={MessageCircle} title="No conversations yet" description={role === "buyer" ? "Open a product and tap Chat to ask the seller a question." : "Buyer questions will appear here."} />
        ) : (
          <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
            {threads.map((t) => {
              const last = [...t.messages].reverse().find((m) => m.from !== "system");
              const unread = t.unread[role];
              return (
                <li key={t.id}>
                  <button type="button" onClick={() => setActiveId(t.id)} className={cn("grid w-full gap-0.5 px-4 py-3 text-left hover:bg-gray-50", t.id === activeId && "bg-gray-50")}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{role === "buyer" ? t.storeName : t.buyerName}</span>
                      <span className="shrink-0 text-[11px] text-gray-400">{day(t.updatedAt)}</span>
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn("truncate text-sm", unread ? "font-medium text-gray-900" : "text-gray-500")}>
                        {last ? (last.from === role ? "You: " : "") + (last.from === role && last.original ? last.original : last.text) : "New conversation"}
                      </span>
                      {unread > 0 && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-orange-500 text-[11px] text-white">{unread}</span>}
                      {role === "seller" && t.flagged > 0 && <AlertTriangle className="size-4 shrink-0 text-red-500" aria-label="Flagged messages" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
      {active ? (
        <Thread key={active.id} thread={active} role={role} onBack={() => setActiveId(null)} />
      ) : (
        <div className="hidden flex-1 place-items-center p-8 text-center text-sm text-gray-500 md:grid">Choose a conversation</div>
      )}
    </div>
  );
}
