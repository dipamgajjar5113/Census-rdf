-- Community Census — Supabase schema
-- Run in the Supabase SQL editor. The app accesses these tables with the
-- service-role key server-side only; no public RLS access is required.

create table if not exists checkins (
  id text primary key,
  v smallint not null default 2,
  day date not null,
  stress text,
  sources text[],
  stressor text,
  signs text,
  coping text,
  goal text,
  created_at timestamptz not null default now()
);

create index if not exists checkins_created_at_idx on checkins (created_at desc);

create table if not exists config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Keep config.updated_at fresh on write.
create or replace function touch_config_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists config_touch on config;
create trigger config_touch before update on config
  for each row execute function touch_config_updated_at();

-- Enable RLS; no policies = locked to anon/auth clients.
-- The server uses the service-role key which bypasses RLS.
alter table checkins enable row level security;
alter table config enable row level security;
