-- Alaba marketplace: stores, brands, variants, per-store orders and payouts,
-- chat with scam flags, sponsored ads, subscriptions, loyalty, stock holds.
-- Money is integer kobo (NGN) or fen (RMB) everywhere.

-- ---------- Sellers ----------
create type seller_type as enum ('manufacturer','vendor');
create type store_status as enum ('pending_review','active','suspended');

create table subscription_plans (
  id text primary key,
  name text not null,
  price_kobo bigint not null default 0,
  listing_cap int,                       -- null = unlimited
  search_boost numeric(4,3) not null default 0,
  features text[] not null default '{}',
  active boolean not null default true
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  type seller_type not null,
  is_platform boolean not null default false,  -- Alaba Verified
  status store_status not null default 'pending_review',
  verified boolean not null default false,
  tagline text, description text,
  city text not null, state text not null,
  cac_number text,
  plan_id text not null default 'free' references subscription_plans,
  free_delivery_over_kobo bigint,
  manufacturing jsonb,                   -- moq, capacity, lead time, customisation, certifications
  bank_account jsonb,                    -- Paystack transfer recipient; never exposed to the browser
  -- Computed by jobs from orders, never written by sellers.
  metrics jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create unique index stores_one_platform on stores (is_platform) where is_platform;
create index stores_plan_idx on stores (plan_id);

create table store_members (
  store_id uuid references stores on delete cascade,
  user_id uuid references profiles on delete cascade,
  role text not null default 'owner' check (role in ('owner','staff')),
  primary key (store_id, user_id)
);
create index store_members_user_idx on store_members (user_id);

create table seller_subscriptions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores on delete cascade,
  plan_id text not null references subscription_plans,
  status text not null default 'active' check (status in ('active','past_due','cancelled')),
  paystack_subscription_code text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);
create index seller_subscriptions_store_idx on seller_subscriptions (store_id);
create index seller_subscriptions_plan_idx on seller_subscriptions (plan_id);

-- ---------- Brands ----------
create table brands (
  slug text primary key,
  name text not null unique,
  official boolean not null default false,
  country text not null default 'Nigeria',
  description text,
  created_by uuid references profiles,
  created_at timestamptz not null default now()
);
create index brands_created_by_idx on brands (created_by);
create table brand_applications (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null, owner_company text not null, trademark text not null,
  website text, email text not null, phone text not null,
  role text not null check (role in ('owner','distributor','agency')),
  status text not null default 'pending' check (status in ('pending','approved','declined')),
  applicant uuid references profiles,
  reviewed_by uuid references profiles,
  created_at timestamptz not null default now()
);
create index brand_applications_applicant_idx on brand_applications (applicant);
create index brand_applications_reviewed_by_idx on brand_applications (reviewed_by);

-- ---------- Catalogue changes ----------
alter table products add column store_id uuid references stores;
alter table products add column brand_slug text references brands;
alter table products add column wholesale jsonb not null default '[]';   -- [{minQty, discount}]
alter table products add column free_delivery boolean not null default false;
alter table products add column condition text not null default 'new' check (condition in ('new','refurbished','used'));
alter table products add column warranty text;
-- TikTok / Instagram only (validated again in the app).
alter table products add column video_url text check (
  video_url is null or video_url ~ '^https://((www|m|vm|vt)\.)?tiktok\.com/' or video_url ~ '^https://(www\.)?instagram\.com/(reel|reels|p|tv)/'
);
-- Imported products belong to the platform store only.
alter table products add column tags text[] not null default '{}';
create index products_store_idx on products (store_id);
create index products_brand_idx on products (brand_slug);

create or replace function private.enforce_imported_platform() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.source = 'imported' then
    if not exists (select 1 from public.stores s where s.id = new.store_id and s.is_platform) then
      raise exception 'Imported products can only be sold by Alaba Verified';
    end if;
    if not ('imported' = any(new.tags)) then new.tags := array_append(new.tags, 'imported'); end if;
  end if;
  return new;
end $$;
revoke all on function private.enforce_imported_platform() from public, anon, authenticated;
create trigger products_imported_platform before insert or update on products
  for each row execute function private.enforce_imported_platform();

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  sku text unique not null,
  options jsonb not null default '{}',
  supplier_price_fen bigint,             -- imported only, admin-only
  price_kobo bigint,                     -- local only
  compare_at_kobo bigint,
  stock int not null default 0 check (stock >= 0),
  active boolean not null default true
);
create index product_variants_product_idx on product_variants (product_id);

-- Checkout holds stock for 15 minutes so two buyers can't buy the last unit.
create table stock_reservations (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants on delete cascade,
  order_id uuid references orders on delete cascade,
  quantity int not null check (quantity > 0),
  expires_at timestamptz not null default now() + interval '15 minutes'
);
create index stock_reservations_variant_idx on stock_reservations (variant_id);
create index stock_reservations_order_idx on stock_reservations (order_id);

-- ---------- Orders split per store ----------
alter table orders drop constraint if exists orders_provider_check;
alter table orders add constraint orders_provider_check check (provider = 'paystack');
alter table orders add column carrier text not null default 'gig' check (carrier in ('gig','jumia'));
alter table orders add column delivery_confirmed_at timestamptz;
alter table orders add column loyalty_kobo bigint not null default 0;
alter table order_items add column variant_id uuid references product_variants;
alter table order_items add column store_id uuid references stores;
create index order_items_variant_idx on order_items (variant_id);
create index order_items_store_idx on order_items (store_id);

create type payout_status as enum ('not_applicable','held','awaiting_approval','approved','paid','frozen');

create table store_orders (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  store_id uuid not null references stores,
  carrier text not null check (carrier in ('gig','jumia')),
  method text not null check (method in ('door','pickup')),
  tracking_number text,
  delivery_kobo bigint not null default 0,
  free_delivery boolean not null default false,
  subtotal_kobo bigint not null,
  commission_kobo bigint not null default 0,
  payout payout_status not null default 'held',
  delivered_at timestamptz,
  unique (order_id, store_id)
);
create index store_orders_store_idx on store_orders (store_id);

create table payouts (
  id uuid primary key default gen_random_uuid(),
  store_order_id uuid not null unique references store_orders on delete restrict,
  amount_kobo bigint not null,
  status payout_status not null,
  approved_by uuid references profiles,
  approved_at timestamptz,
  paystack_transfer_code text,
  created_at timestamptz not null default now()
);
create index payouts_approved_by_idx on payouts (approved_by);

-- ---------- Chat ----------
create table chat_threads (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores on delete cascade,
  buyer_id uuid not null references profiles on delete cascade,
  product_id uuid references products on delete set null,
  flagged_count int not null default 0,
  updated_at timestamptz not null default now(),
  unique (store_id, buyer_id)
);
create index chat_threads_buyer_idx on chat_threads (buyer_id);
create index chat_threads_product_idx on chat_threads (product_id);

create table chat_messages (
  id bigserial primary key,
  thread_id uuid not null references chat_threads on delete cascade,
  sender uuid not null references profiles,
  sender_role text not null check (sender_role in ('buyer','seller','system')),
  body text not null,                    -- masked text shown to the other party
  original_body text,                    -- unmasked, staff-only (column grant below)
  flags jsonb not null default '[]',
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);
create index chat_messages_thread_idx on chat_messages (thread_id, created_at);
create index chat_messages_sender_idx on chat_messages (sender);

create table chat_reports (
  id uuid primary key default gen_random_uuid(),
  message_id bigint references chat_messages on delete set null,
  thread_id uuid not null references chat_threads on delete cascade,
  reporter uuid not null references profiles,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create index chat_reports_thread_idx on chat_reports (thread_id);
create index chat_reports_message_idx on chat_reports (message_id);
create index chat_reports_reporter_idx on chat_reports (reporter);

-- ---------- Sponsored ads ----------
create table ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores on delete cascade,
  name text not null,
  model text not null check (model in ('cpc','cpm','cpa')),
  bid numeric(12,4) not null,            -- kobo for cpc/cpm; share of sale for cpa
  daily_budget_kobo bigint not null,
  product_ids uuid[] not null default '{}',
  keywords text[] not null default '{}',
  status text not null default 'pending_review' check (status in ('pending_review','active','paused')),
  created_at timestamptz not null default now()
);
create index ad_campaigns_store_idx on ad_campaigns (store_id);

create table ad_events (
  id bigserial primary key,
  campaign_id uuid not null references ad_campaigns on delete cascade,
  kind text not null check (kind in ('impression','click','conversion')),
  viewer_hash text,                      -- hashed device/user for dedupe; no raw identifiers
  order_id uuid references orders,
  billable boolean not null default true,
  invalid_reason text,
  cost_kobo bigint not null default 0,
  created_at timestamptz not null default now()
);
create index ad_events_campaign_idx on ad_events (campaign_id, created_at);
create index ad_events_order_idx on ad_events (order_id);

-- ---------- Loyalty ----------
create table loyalty_ledger (
  id bigserial primary key,
  user_id uuid not null references profiles on delete cascade,
  order_id uuid references orders on delete set null,
  points int not null,                   -- positive = earn, negative = redeem/expire
  reason text not null,
  pending boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index loyalty_ledger_user_idx on loyalty_ledger (user_id);
create index loyalty_ledger_order_idx on loyalty_ledger (order_id);

-- ---------- Search ----------
create table search_synonyms (term text primary key, maps_to text not null);

-- ---------- Membership helper ----------
create or replace function private.is_store_member(sid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.store_members m where m.store_id = sid and m.user_id = (select auth.uid()));
$$;
grant execute on function private.is_store_member(uuid) to anon, authenticated;

-- ---------- RLS ----------
do $$
declare t text;
begin
  foreach t in array array['subscription_plans','stores','store_members','seller_subscriptions','brands','brand_applications','product_variants','stock_reservations','store_orders','payouts','chat_threads','chat_messages','chat_reports','ad_campaigns','ad_events','loyalty_ledger','search_synonyms'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

create policy "public plans" on subscription_plans for select using (active);
create policy "public stores" on stores for select using (status = 'active' or private.is_store_member(id) or private.has_permission('sellers'));
create policy "members see membership" on store_members for select using (user_id = (select auth.uid()) or private.has_permission('sellers'));
create policy "members see subscription" on seller_subscriptions for select using (private.is_store_member(store_id) or private.has_permission('sellers'));
create policy "public brands" on brands for select using (true);
create policy "apply for brand" on brand_applications for insert with check (applicant = (select auth.uid()) and status = 'pending');
create policy "see own brand application" on brand_applications for select using (applicant = (select auth.uid()) or private.has_permission('products'));
create policy "public variants" on product_variants for select using (active or private.has_permission('products'));
create policy "store sees its store orders" on store_orders for select using (
  private.is_store_member(store_id) or private.has_permission('orders')
  or exists (select 1 from orders o where o.id = order_id and o.user_id = (select auth.uid()))
);
create policy "store sees its payouts" on payouts for select using (
  private.has_permission('finance') or exists (select 1 from store_orders so where so.id = store_order_id and private.is_store_member(so.store_id))
);
create policy "thread parties" on chat_threads for select using (buyer_id = (select auth.uid()) or private.is_store_member(store_id) or private.has_permission('support'));
create policy "buyer opens thread" on chat_threads for insert with check (buyer_id = (select auth.uid()));
create policy "thread messages" on chat_messages for select using (
  exists (select 1 from chat_threads t where t.id = thread_id and (t.buyer_id = (select auth.uid()) or private.is_store_member(t.store_id) or private.has_permission('support')))
);
-- Messages are inserted by a server action after scanning; no direct client inserts.
create policy "report from thread" on chat_reports for insert with check (
  reporter = (select auth.uid()) and exists (select 1 from chat_threads t where t.id = thread_id and t.buyer_id = (select auth.uid()))
);
create policy "staff reports" on chat_reports for select using (private.has_permission('support'));
create policy "store campaigns" on ad_campaigns for select using (private.is_store_member(store_id) or private.has_permission('marketing'));
create policy "store ad events" on ad_events for select using (
  private.has_permission('marketing') or exists (select 1 from ad_campaigns c where c.id = campaign_id and private.is_store_member(c.store_id))
);
create policy "own points" on loyalty_ledger for select using (user_id = (select auth.uid()) or private.has_permission('support'));
create policy "public synonyms" on search_synonyms for select using (true);

-- Never expose raw chat text, bank details or variant supplier cost to the browser.
revoke select on chat_messages from anon, authenticated;
grant select (id, thread_id, sender, sender_role, body, flags, blocked, created_at) on chat_messages to authenticated;
revoke select on stores from anon, authenticated;
grant select (id, slug, name, type, is_platform, status, verified, tagline, description, city, state, plan_id, free_delivery_over_kobo, manufacturing, metrics, created_at) on stores to anon, authenticated;
revoke select on product_variants from anon, authenticated;
grant select (id, product_id, sku, options, price_kobo, compare_at_kobo, stock, active) on product_variants to anon, authenticated;
grant select (store_id, brand_slug, wholesale, free_delivery, condition, warranty, video_url, tags) on products to anon, authenticated;

-- ---------- New permissions ----------
insert into role_permissions (role, permission) values
  ('order_manager','sellers'), ('finance','sellers'), ('order_manager','marketing'), ('support','sellers')
on conflict do nothing;

-- ---------- Seed ----------
insert into subscription_plans (id, name, price_kobo, listing_cap, search_boost, features) values
  ('free','Free',0,50,0,'{"Up to 50 listings","Store page","Chat with buyers","Alaba Buyer Protection"}'),
  ('pro','Pro',500000,500,0.1,'{"Up to 500 listings","Search visibility boost","Featured in category pages","Sales analytics"}'),
  ('business','Business',2500000,null,0.2,'{"Unlimited listings","Higher visibility boost","Homepage store spotlight","Priority support"}')
on conflict (id) do nothing;

insert into stores (slug, name, type, is_platform, status, verified, tagline, city, state, plan_id, free_delivery_over_kobo)
values ('alaba-verified','Alaba Verified','vendor',true,'active',true,'Sold and shipped by Alaba','Ojo','Lagos','business',10000000)
on conflict (slug) do nothing;

insert into settings (key, value) values
  ('sponsored_ads_enabled', 'false'),
  ('buyer_protection', '{"autoConfirmHours":72,"disputeWindowHours":72}'),
  ('commission', '{"default":0.08,"byCategory":{"phones":0.06,"computers":0.06,"fashion":0.12,"beauty":0.12}}'),
  ('loyalty', '{"pointsPerNaira":0.01,"nairaPerPoint":1,"minRedeemPoints":500,"maxRedeemShare":0.1,"expiryMonths":12}'),
  ('carriers', '{"gig":{"active":true},"jumia":{"active":true,"pickupDiscount":0.3}}')
on conflict (key) do nothing;

insert into search_synonyms (term, maps_to) values
  ('fone','phone'),('handset','phone'),('powerbank','power bank'),('earpiece','earbuds'),('lappy','laptop'),('gen','generator'),('nepa','rechargeable')
on conflict do nothing;
