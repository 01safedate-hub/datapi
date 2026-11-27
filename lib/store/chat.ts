"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { scanMessage, type ScamFlag } from "@/lib/scam";

/**
 * Buyer–seller chat. Demo transport: localStorage + cross-tab sync, so a buyer
 * tab and a seller tab update each other instantly. Production swaps this for
 * Supabase Realtime on `chat_messages`, with the same scan run server-side.
 */

export type ChatRole = "buyer" | "seller" | "system";

export type ChatMessage = {
  id: string;
  from: ChatRole;
  /** What the other side sees (masked when blocked). */
  text: string;
  /** Sender's own copy. */
  original?: string;
  at: string;
  flags: ScamFlag[];
  blocked: boolean;
  product?: { slug: string; name: string; image: string; priceKobo: number };
};

export type ChatThread = {
  id: string;
  storeSlug: string;
  storeName: string;
  buyerName: string;
  /** Completed orders between this buyer and seller (drives the trust-pattern warning). */
  completedOrders: number;
  messages: ChatMessage[];
  unread: { buyer: number; seller: number };
  flagged: number;
  updatedAt: string;
};

type ChatState = {
  threads: ChatThread[];
  open: (args: { storeSlug: string; storeName: string; completedOrders: number; product?: ChatMessage["product"] }) => string;
  send: (threadId: string, from: Exclude<ChatRole, "system">, text: string) => ChatMessage | null;
  markRead: (threadId: string, as: Exclude<ChatRole, "system">) => void;
};

const id = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const seed: ChatThread[] = [
  {
    id: "thr_demo_lekki",
    storeSlug: "lekki-gadget-hub",
    storeName: "Lekki Gadget Hub",
    buyerName: "Adaeze O.",
    completedOrders: 2,
    unread: { buyer: 1, seller: 0 },
    flagged: 1,
    updatedAt: "2026-11-26T15:10:00Z",
    messages: [
      { id: "m1", from: "buyer", text: "Hi, do you have the Nexa 65W charger in white?", at: "2026-11-26T14:58:00Z", flags: [], blocked: false },
      { id: "m2", from: "seller", text: "Yes we do! Same price as listed.", at: "2026-11-26T15:02:00Z", flags: [], blocked: false },
      {
        id: "m3",
        from: "seller",
        text: "Since you're a regular customer, send to my GTB [number hidden] and I'll give you 10% off 👍",
        at: "2026-11-26T15:10:00Z",
        flags: [{ kind: "bank_account", match: "hidden", severity: "block" }, { kind: "off_platform_payment", match: "gtb", severity: "block" }],
        blocked: true,
      },
    ],
  },
];

export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      threads: seed,
      open: ({ storeSlug, storeName, completedOrders, product }) => {
        const existing = get().threads.find((t) => t.storeSlug === storeSlug);
        if (existing) {
          if (product && !existing.messages.some((m) => m.product?.slug === product.slug)) {
            const msg: ChatMessage = { id: id(), from: "system", text: "You're asking about", at: now(), flags: [], blocked: false, product };
            set({ threads: get().threads.map((t) => (t.id === existing.id ? { ...t, messages: [...t.messages, msg] } : t)) });
          }
          return existing.id;
        }
        const t: ChatThread = {
          id: `thr_${id()}`,
          storeSlug,
          storeName,
          buyerName: "You",
          completedOrders,
          unread: { buyer: 0, seller: 0 },
          flagged: 0,
          updatedAt: now(),
          messages: product ? [{ id: id(), from: "system", text: "You're asking about", at: now(), flags: [], blocked: false, product }] : [],
        };
        set({ threads: [t, ...get().threads] });
        return t.id;
      },
      send: (threadId, from, text) => {
        const clean = text.trim();
        if (!clean) return null;
        const scan = scanMessage(clean);
        const msg: ChatMessage = {
          id: id(),
          from,
          text: scan.safeText,
          original: scan.blocked ? clean : undefined,
          at: now(),
          flags: scan.flags,
          blocked: scan.blocked,
        };
        const other = from === "buyer" ? "seller" : "buyer";
        set({
          threads: get().threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [...t.messages, msg],
                  updatedAt: msg.at,
                  unread: { ...t.unread, [other]: t.unread[other] + 1 },
                  flagged: t.flagged + (scan.flags.length ? 1 : 0),
                }
              : t,
          ),
        });
        return msg;
      },
      markRead: (threadId, as) =>
        set({ threads: get().threads.map((t) => (t.id === threadId && t.unread[as] ? { ...t, unread: { ...t.unread, [as]: 0 } } : t)) }),
    }),
    { name: "alaba-chat", version: 1, storage: createJSONStorage(() => localStorage) },
  ),
);

/** Live sync: another tab wrote to the chat, so reload it here. */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "alaba-chat") void useChat.persist.rehydrate();
  });
}
