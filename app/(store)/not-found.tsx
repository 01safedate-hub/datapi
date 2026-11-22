import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";

export default function StoreNotFound() {
  return (
    <div className="container-page py-8">
      <EmptyState
        icon={Compass}
        title="We can't find that page"
        description="The link may be old or the product may have been removed. Try searching, or head back to the shop."
        action={
          <>
            <ButtonLink href="/shop" variant="accent">Browse products</ButtonLink>
            <ButtonLink href="/" variant="outline">Go home</ButtonLink>
          </>
        }
      />
    </div>
  );
}
