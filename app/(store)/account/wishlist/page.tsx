import { queryProducts } from "@/lib/catalog";
import { WishlistView } from "./wishlist-view";

export const metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return <WishlistView products={queryProducts()} />;
}
