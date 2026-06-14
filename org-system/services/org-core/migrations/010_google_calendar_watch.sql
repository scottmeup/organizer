create table if not exists google_calendar_watch_channels (
  id uuid primary key default gen_random_uuid(),
  calendar_id text not null,
  channel_id text not null unique,
  resource_id text not null,
  expiration timestamptz not null,
  webhook_token text null,
  sync_token text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists google_calendar_watch_channels_calendar_idx
  on google_calendar_watch_channels(calendar_id);
