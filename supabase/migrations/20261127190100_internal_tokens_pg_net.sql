-- Lets scheduled jobs and the database call our edge functions.
create extension if not exists pg_net with schema extensions;

-- Shared secrets for server-to-function calls. RLS on with no policies: only the service role can read.
create table if not exists public.internal_tokens (
  name text primary key,
  token text not null default encode(extensions.gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now()
);
alter table public.internal_tokens enable row level security;
insert into public.internal_tokens (name) values ('tasks') on conflict do nothing;
