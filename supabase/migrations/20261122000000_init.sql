-- Shupzy initial schema. Not yet applied to the `shupzy` Supabase project.
-- Money: integer kobo (NGN) and fen (RMB). Never floats.

create extension if not exists pg_trgm;

-- ---------- People & roles ----------
create type staff_role as enum ('super_admin','order_manager','product_manager','warehouse','support','finance');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  phone text,
  staff_role staff_role,               -- null = customer
  marketing_opt_in boolean not null default false,
  whatsapp_opt_in boolean not null default true,
  created_at timestamptz not null default now()
);

create table role_permissions (
  role staff_role not null,
  permission text not null,            -- orders | products | warehouse | support | finance | settings
  primary key (role, permission)
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  label text, recipient text not null, line1 text not null, city text not null, state text not null, phone text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Catalogue ----------
create table categories (
  slug text primary key, name text not null, description text, sort int not null default 0,
  markup_pct numeric(5,2)              -- null = default markup
);

create type product_source as enum ('imported','local');
create type product_status as enum ('draft','active','archived');
create type availability as enum ('in_stock','preorder','out_of_stock');

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null, brand text, description text, highlights text[] not null default '{}', specs jsonb not null default '{}',
  category text not null references categories,
  source product_source not null,
  origin text not null default 'manual',     -- manual | alibaba
  external_id text,                          -- Alibaba product id
  seller_id uuid,                            -- future multi-vendor
  status product_status not null default 'draft',
  supplier_price_fen bigint,                 -- imported only, admin-only
  price_kobo bigint,                         -- local only
  compare_at_kobo bigint,
  est_weight_g int not null,
  dims_cm int[] not null default '{0,0,0}',
  moq int not null default 1,
  stock int not null default 0,
  availability availability not null default 'in_stock',
  delivery_days int4range not null,
  options jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((source = 'imported' and supplier_price_fen is not null) or (source = 'local' and price_kobo is not null))
);
create index products_search_idx on products using gin ((name || ' ' || coalesce(brand,'')) gin_trgm_ops);

create table product_media (id uuid primary key default gen_random_uuid(), product_id uuid not null references products on delete cascade, path text not null, sort int not null default 0);
create table reviews (id uuid primary key default gen_random_uuid(), product_id uuid not null references products on delete cascade, user_id uuid references profiles, rating int not null check (rating between 1 and 5), title text, body text, approved boolean not null default false, created_at timestamptz not null default now());
create table wishlists (user_id uuid references profiles on delete cascade, product_id uuid references products on delete cascade, created_at timestamptz not null default now(), primary key (user_id, product_id));

-- ---------- Pricing (history kept, never overwritten) ----------
create table fx_rates (id bigserial primary key, ngn_per_rmb numeric(10,4) not null, effective_from timestamptz not null default now(), set_by uuid references profiles);
create table shipping_agents (id uuid primary key default gen_random_uuid(), name text not null, mode text not null default 'air', rate_per_kg_kobo bigint not null, clearance_per_kg_kobo bigint not null default 0, volumetric_divisor int not null default 6000, min_chargeable_kg numeric(6,2) not null default 0.5, active boolean not null default true);
create table delivery_zones (id text primary key, name text not null, states text[] not null default '{}', base_kobo bigint not null, per_kg_kobo bigint not null, days int4range not null);
create table pickup_points (id text primary key, name text not null, address text not null, fee_kobo bigint not null default 0, active boolean not null default true);
create table settings (key text primary key, value jsonb not null, updated_at timestamptz not null default now());

create table discounts (
  code text primary key, type text not null check (type in ('percent','fixed')), value bigint not null,
  min_spend_kobo bigint not null default 0, first_order_only boolean not null default false,
  usage_limit int, used int not null default 0, expires_at timestamptz, active boolean not null default true
);

-- ---------- Orders ----------
create type order_stage as enum ('pending_payment','paid','sourcing','purchased','china_warehouse','awaiting_balance','dispatched','arrived_ng','customs_cleared','ng_warehouse','out_for_delivery','ready_for_pickup','delivered','cancelled','refunded');

create table orders (
  id uuid primary key default gen_random_uuid(),
  number text unique not null,
  user_id uuid references profiles,          -- null = guest
  email text not null, phone text not null, customer_name text not null,
  fulfilment text not null check (fulfilment in ('delivery','pickup')),
  address jsonb, pickup_point text references pickup_points,
  stage order_stage not null default 'pending_payment',
  provider text not null check (provider in ('paystack','flutterwave')),
  pricing_snapshot jsonb not null,           -- every rate used, frozen at order time
  items_kobo bigint not null, intl_shipping_kobo bigint not null, local_delivery_kobo bigint not null,
  discount_kobo bigint not null default 0, vat_kobo bigint not null default 0, total_kobo bigint not null,
  paid_kobo bigint not null default 0, balance_due_kobo bigint not null default 0,
  discount_code text references discounts,
  assigned_to uuid references profiles,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  product_id uuid not null references products,
  name text not null, options jsonb not null default '{}', quantity int not null check (quantity > 0),
  source product_source not null,
  unit_price_kobo bigint not null, supplier_cost_fen bigint,
  est_weight_g int not null, actual_weight_g int, dims_cm int[],
  stage order_stage not null default 'paid'  -- item-level stage allows partial fulfilment
);

create table order_events (id bigserial primary key, order_id uuid not null references orders on delete cascade, stage order_stage not null, note text, actor uuid references profiles, created_at timestamptz not null default now());
create table order_approvals (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders on delete cascade, kind text not null, amount_kobo bigint not null default 0, status text not null default 'pending', created_at timestamptz not null default now(), resolved_at timestamptz);
create table order_notes (id bigserial primary key, order_id uuid not null references orders on delete cascade, body text not null, author uuid references profiles, created_at timestamptz not null default now());

-- ---------- Sourcing & logistics ----------
create table suppliers (id uuid primary key default gen_random_uuid(), name text not null, city text, contact text, platform text);
create table supplier_purchases (id uuid primary key default gen_random_uuid(), supplier_id uuid not null references suppliers, order_item_id uuid not null references order_items, supplier_ref text, paid_fen bigint not null, fx_used numeric(10,4) not null, created_at timestamptz not null default now(), created_by uuid references profiles);
create table warehouses (id text primary key, name text not null, country text not null);
create table shipments (id uuid primary key default gen_random_uuid(), code text unique not null, agent_id uuid references shipping_agents, waybill text, chargeable_kg numeric(8,2), cost_kobo bigint, stage text not null default 'packing', dispatched_at timestamptz, eta_at timestamptz);
create table shipment_items (shipment_id uuid references shipments on delete cascade, order_item_id uuid references order_items, primary key (shipment_id, order_item_id));

-- ---------- Money ----------
create table payments (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders, provider text not null, reference text unique not null, amount_kobo bigint not null, fee_kobo bigint not null default 0, status text not null, raw jsonb, created_at timestamptz not null default now());
create table refunds (id uuid primary key default gen_random_uuid(), order_id uuid not null references orders, amount_kobo bigint not null, reason text not null, status text not null default 'pending', approved_by uuid references profiles, created_at timestamptz not null default now());
create table expenses (id uuid primary key default gen_random_uuid(), category text not null, amount_kobo bigint not null, note text, incurred_on date not null default current_date);

-- ---------- Support, content, audit ----------
create table tickets (id uuid primary key default gen_random_uuid(), order_id uuid references orders, user_id uuid references profiles, subject text not null, status text not null default 'open', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table ticket_messages (id bigserial primary key, ticket_id uuid not null references tickets on delete cascade, author uuid references profiles, body text not null, created_at timestamptz not null default now());
create table email_templates (id text primary key, subject text not null, body text not null, updated_at timestamptz not null default now());
create table audit_log (id bigserial primary key, actor uuid references profiles, action text not null, table_name text, row_id text, before jsonb, after jsonb, created_at timestamptz not null default now());

-- ---------- Row Level Security ----------
create or replace function has_permission(perm text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    left join role_permissions rp on rp.role = p.staff_role
    where p.id = auth.uid() and (p.staff_role = 'super_admin' or rp.permission = perm)
  );
$$;

alter table profiles enable row level security;
alter table addresses enable row level security;
alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table wishlists enable row level security;
alter table reviews enable row level security;
alter table tickets enable row level security;
alter table payments enable row level security;
alter table refunds enable row level security;
alter table audit_log enable row level security;

create policy "own profile" on profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own addresses" on addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own wishlist" on wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own orders" on orders for select using (user_id = auth.uid() or has_permission('orders'));
create policy "own order items" on order_items for select using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or has_permission('orders'))));
create policy "own tickets" on tickets for all using (user_id = auth.uid() or has_permission('support'));
create policy "public categories" on categories for select using (true);
create policy "staff categories" on categories for all using (has_permission('products'));
create policy "staff products" on products for all using (has_permission('products'));
create policy "approved reviews" on reviews for select using (approved or user_id = auth.uid());
create policy "finance payments" on payments for select using (has_permission('finance'));
create policy "finance refunds" on refunds for all using (has_permission('finance'));
create policy "admin audit" on audit_log for select using (has_permission('settings'));

-- Public product view hides supplier cost columns.
create view public_products with (security_invoker = false) as
  select id, slug, name, brand, description, highlights, specs, category, source, compare_at_kobo, price_kobo,
         est_weight_g, dims_cm, moq, availability, delivery_days, options, created_at
  from products where status = 'active';
grant select on public_products to anon, authenticated;
