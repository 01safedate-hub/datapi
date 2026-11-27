# Alaba

**alaba.ng**: a Nigerian marketplace inspired by Alaba International Market. Manufacturers, importers and vendors sell directly to buyers, with **Alaba Buyer Protection**: buyers pay Alaba, and sellers are paid only after delivery is confirmed.

Built with Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS 4 and TypeScript. The app runs on **mock data** for now. Every external service (Supabase, Paystack, TMPI, GIG, Jumia, Resend, WhatsApp) sits behind a small module, so each can be switched on without touching pages.

## Run it

```bash
pnpm install
pnpm dev            # http://localhost:3000 · admin at /admin · seller centre at /seller
pnpm test           # vitest: pricing, delivery, video links, chat scam filter
pnpm build && pnpm start
pnpm lint
```

## What's inside

| Area | Routes |
| --- | --- |
| Store | `/`, `/shop` (facets: seller type, verified, wholesale, source, price), `/c/[slug]`, `/p/[slug]`, `/search`, `/cart`, `/checkout`, `/track` |
| Marketplace | `/store/[slug]`, `/manufacturers`, `/brands`, `/brands/[slug]`, `/brands/register`, `/buyer-protection`, `/messages` |
| Sellers | `/sell`, `/sell/apply` (manufacturer vs vendor), `/seller` overview, orders, products (+ new listing), messages, sponsored ads, plan & listings, payouts |
| Account | `/account`, orders (per-shipment tracking + confirm delivery), rewards (loyalty points), payments, addresses, wishlist, support, settings |
| Admin | dashboard, orders, sellers, payouts (approve / freeze / mark paid), chat safety, sponsored ads (on/off switch), seller plans, brands (+ official brand approvals), China import (TMPI), products, stock forecasting, sourcing, warehouse, shipments, deliveries, pricing, discounts, reports, staff, settings, audit |

## Key decisions

- **Buyer Protection, no escrow**: Paystack collects into Alaba's account. Each seller's share sits in a `store_order` with payout status `held → awaiting_approval → approved → paid` (or `frozen` on dispute). Buyers confirm delivery, or it auto-confirms 72 h after delivery.
- **Multi-seller orders**: one checkout, one `store_order` per seller, each with its own GIG/Jumia shipment and tracking number. Delivery = sum of each seller's shipment (`lib/delivery.ts`: same-state / same-region / national bands × weight). Free-delivery items and store free-delivery thresholds cost nothing to ship.
- **Variants & wholesale**: every product has variants with their own price, SKU and stock; quantity tiers apply wholesale pricing (`lib/pricing.ts`).
- **Imported products are Alaba-only**: enforced in the app and by a database trigger; tagged `imported`, with admin-set delivery timeframes.
- **Anti-scam chat** (`lib/scam.ts`): phone numbers (including spelled-out digits), emails (including “at/dot”), WhatsApp links, outside links and bank or payment details are detected; contact details are masked before the other side sees them. Buyers see a safety banner on every thread, which escalates once they have 2+ completed orders with that seller.
- **Video links**: TikTok and Instagram only, validated in the app and by a database check.
- **Sponsored ads** (CPC/CPM/CPA) with fraud rules; **off by default** behind an admin switch.
- **Subscriptions** cap listings (Free 50 / Pro 500 / Business unlimited); **loyalty points** earn on delivered orders and redeem at checkout (max 10%).
- **Forecasting**: Holt smoothing over 8 weeks of variant sales with safety stock and reorder suggestions.
- **Search**: synonyms and Nigerian shopping slang (“fone”, “nepa”, “gen”), stopwords, fuzzy matching across name, brand, tags and specs.

## Going live

1. The marketplace schema (`supabase/migrations/20261127000000_marketplace.sql`) is applied. Swap `lib/catalog.ts`, `lib/orders.ts`, `lib/marketplace.ts` and `lib/store/chat.ts` to Supabase (chat → Supabase Realtime on `chat_messages`; insert through a server action that runs `scanMessage`).
2. Add `PAYSTACK_SECRET_KEY`; wire `placeOrder` and a `/api/webhooks/paystack` route; use Paystack Transfers for approved payouts.
3. Add `TMPI_API_KEY` and `TMPI_API_URL`, then fill in the field mapping in `lib/tmpi.ts` from the TMPI docs.
4. Replace `public/carriers/gig.svg` and `jumia.svg` with the official logos (same file names). Connect GIG and Jumia APIs when ready; rates live in `lib/data/settings.ts` until then.
5. Connect Resend and WhatsApp templates. Have legal pages, seller terms and VAT treatment reviewed.
