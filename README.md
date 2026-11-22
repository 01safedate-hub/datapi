# Shupzy

Storefront and admin for selling **imported (China) and local products in naira**, with sourcing, warehouse weighing, shipping, delivery and finance in one dashboard.

Built with Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4 and TypeScript. The app runs entirely on **mock data** for now; every external service (Supabase, Paystack, Flutterwave, Alibaba, Resend, WhatsApp) sits behind a small module so it can be switched on without touching pages.

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000  ·  admin at /admin
pnpm build && pnpm start
pnpm typecheck && pnpm lint
```

Copy `.env.example` to `.env.local` when you're ready to connect real services.

## What's inside

| Area | Routes |
| --- | --- |
| Store | `/`, `/shop`, `/c/[slug]`, `/p/[slug]`, `/search`, `/cart`, `/checkout`, `/checkout/success`, `/track` |
| Account | `/account`, `/account/orders/[number]`, `/account/payments`, `/account/addresses`, `/account/wishlist`, `/account/support`, `/account/settings` |
| Auth | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| Info | `/how-it-works`, `/shipping`, `/faq`, `/about`, `/contact`, `/privacy`, `/terms`, `/refund-policy` |
| Admin | `/admin` dashboard, orders, sourcing queue, China warehouse (weighing + balance requests), shipments, deliveries, products (+ editor, CSV, Alibaba import), categories, suppliers, pricing rules, discounts, customers, support, reports (CSV export), content, staff & roles, settings, audit log |
| Other | `/invoice/[number]` (printable), `/offline`, `manifest.webmanifest`, `sitemap.xml`, `robots.txt`, OG images |

## Key decisions

- **Pricing engine** (`lib/pricing.ts`): RMB × FX × (1 + markup), rounded up to ₦50; air freight by chargeable weight `max(actual, L×W×H ÷ 6000)`; zone-based local delivery. The same pure functions run in the browser for instant feedback and on the server, which recomputes every checkout total.
- **No surprise charges**: if measured weight costs more than the estimate, the order moves to *Awaiting balance* and the customer approves before dispatch.
- **Frozen rates**: each order stores the FX and rates it was placed at, so reports never change retroactively.
- **Customer never stuck**: toasts with undo, inline validation that focuses the first error, saved checkout drafts, empty/error/loading states on every page, an offline banner and offline page, and a WhatsApp help button that knows which page you're on.
- **PWA**: installable manifest with maskable icons, shortcuts and screenshots; service worker with network-first pages, cached assets and an offline fallback; update prompt.
- **SEO**: per-page metadata, canonical URLs, Open Graph images (site + per product), JSON-LD (Organization, WebSite search, Product, BreadcrumbList, FAQPage), sitemap and robots.

## Going live (next steps)

1. The schema in `supabase/migrations/` is applied to the `shupzy` Supabase project. Swap `lib/catalog.ts` / `lib/orders.ts` to Supabase queries.
2. Add Paystack and Flutterwave keys; wire `placeOrder` to initialise payment and add webhook routes (`/api/webhooks/paystack`, `/api/webhooks/flutterwave`).
3. Add the Alibaba API key and implement the provider in the import screen.
4. Connect Resend (email) and WhatsApp Cloud API templates.
5. Have the legal pages and VAT treatment reviewed before launch.

Regenerate placeholder product images with `node scripts/generate-product-images.mjs`.
