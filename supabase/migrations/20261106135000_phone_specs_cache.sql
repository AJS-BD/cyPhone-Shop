-- Cache for the live phone-specs Edge Function (specs only, no reviews).
-- `query` is the normalised phone name, e.g. "galaxy s25".
-- The function reads this table first and stores fresh GSMArena results here.
create table if not exists public.phone_specs_cache (
  query text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.phone_specs_cache is
  'Cached GSMArena specs returned by the phone-specs Edge Function. query is the normalised phone name.';

-- The function is public (verify_jwt = false), so the cache is read by the
-- anon role. Writes use the service role from inside the Edge Function.
-- No row-level security policy is needed while RLS stays off for this table.
