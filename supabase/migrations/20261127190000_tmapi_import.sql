-- One product per supplier item, so re-importing refreshes instead of duplicating.
create unique index if not exists products_source_external_idx on public.products (source, external_id) where external_id is not null;
create unique index if not exists product_media_product_path_idx on public.product_media (product_id, path);

-- Every TMAPI request, for quota tracking and debugging. Staff-only.
create table if not exists public.api_calls (
  id bigserial primary key,
  provider text not null default 'tmapi',
  endpoint text not null,
  params jsonb not null default '{}',
  http_status int,
  api_code int,
  message text,
  duration_ms int,
  created_at timestamptz not null default now()
);
alter table public.api_calls enable row level security;
create policy "staff read api calls" on public.api_calls for select using (private.has_permission('products'));

-- Public bucket for mirrored supplier photos (supplier CDNs sometimes block hotlinking).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;
