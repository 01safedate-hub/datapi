import { PageHeader } from "@/components/admin/ui";
import { ChatRoom } from "@/components/chat/chat-room";
import { storeById } from "@/lib/data/stores";
import { demoSellerStoreId } from "@/lib/marketplace";

export const metadata = { title: "Messages" };

export default function SellerMessagesPage() {
  const store = storeById(demoSellerStoreId);
  return (
    <>
      <PageHeader title="Messages" description={<>Demo: open <a href={`/messages?store=${store.slug}`} target="_blank" className="font-medium text-brand-600 hover:underline">the buyer chat</a> in another tab to see messages arrive live.</>} />
      <ChatRoom role="seller" storeSlug={store.slug} />
    </>
  );
}
