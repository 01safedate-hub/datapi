import { Heart, MessageCircle, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { getCategories, getSearchIndex } from "@/lib/catalog";
import { CartButton } from "./cart-button";
import { MobileMenu } from "./mobile-menu";
import { SearchBox } from "./search-box";

export function Header() {
  const categories = getCategories();
  const index = getSearchIndex();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="hidden bg-navy-900 text-white sm:block">
        <div className="container-page flex h-9 items-center justify-between text-[13px]">
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-orange-500" aria-hidden />
            Buy direct from Nigerian makers &amp; sellers · Buyer Protection on every order
          </p>
          <nav aria-label="Help" className="flex gap-5 text-white/80">
            <Link href="/sell" className="font-medium text-orange-400 hover:text-orange-300">Sell on Alaba</Link>
            <Link href="/how-it-works" className="hover:text-white">How it works</Link>
            <Link href="/track" className="hover:text-white">Track order</Link>
            <Link href="/contact" className="hover:text-white">Help</Link>
          </nav>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-3 lg:gap-6">
        <MobileMenu categories={categories} />
        <Logo />
        <SearchBox index={index} className="hidden flex-1 md:block md:max-w-2xl" />
        <nav aria-label="Account" className="ml-auto flex items-center gap-1">
          <Link href="/messages" className="hidden size-10 place-items-center rounded-lg hover:bg-gray-100 sm:grid" aria-label="Messages">
            <MessageCircle className="size-5" />
          </Link>
          <Link href="/account/wishlist" className="hidden size-10 place-items-center rounded-lg hover:bg-gray-100 sm:grid" aria-label="Wishlist">
            <Heart className="size-5" />
          </Link>
          <Link href="/account" className="hidden h-10 items-center gap-2 rounded-lg px-2.5 hover:bg-gray-100 sm:flex">
            <User className="size-5" aria-hidden />
            <span className="hidden text-sm font-medium lg:inline">Account</span>
          </Link>
          <CartButton />
        </nav>
      </div>

      <div className="container-page pb-3 md:hidden">
        <SearchBox index={index} />
      </div>

      <nav aria-label="Categories" className="hidden border-t border-gray-100 md:block">
        <ul className="container-page scrollbar-none flex h-11 items-center gap-6 overflow-x-auto text-sm">
          <li>
            <Link href="/shop" className="font-medium whitespace-nowrap hover:text-brand-600">All products</Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/c/${c.slug}`} className="whitespace-nowrap text-gray-700 hover:text-brand-600">{c.name}</Link>
            </li>
          ))}
          <li className="ml-auto">
            <Link href="/manufacturers" className="font-medium whitespace-nowrap text-navy-900 hover:text-brand-600">Manufacturers</Link>
          </li>
          <li>
            <Link href="/brands" className="font-medium whitespace-nowrap text-navy-900 hover:text-brand-600">Brands</Link>
          </li>
          <li>
            <Link href="/shop?source=imported" className="font-medium whitespace-nowrap text-orange-600 hover:underline">Imported</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
