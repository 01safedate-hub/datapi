"use client";

import { useEffect } from "react";
import { ChatRoom } from "@/components/chat/chat-room";
import { useHydrated } from "@/lib/hooks";
import { useChat, type ChatMessage } from "@/lib/store/chat";

export function MessagesClient({ start }: { start: { storeSlug: string; storeName: string; completedOrders: number; product?: ChatMessage["product"] } | null }) {
  const hydrated = useHydrated();
  const open = useChat((s) => s.open);
  const threadId = useChat((s) => (start ? (s.threads.find((t) => t.storeSlug === start.storeSlug)?.id ?? null) : null));

  useEffect(() => {
    if (hydrated && start) open(start);
    // Open once per arrival from a product or store page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, start?.storeSlug, start?.product?.slug]);

  return <ChatRoom role="buyer" initialThreadId={threadId} />;
}
