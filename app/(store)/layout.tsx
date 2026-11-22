import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";
import { OfflineBanner, WhatsAppFab } from "@/components/store/help-widgets";
import { MobileTabBar } from "@/components/store/mobile-tab-bar";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <OfflineBanner />
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
      <MobileTabBar />
    </>
  );
}
