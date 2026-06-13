create table if not exists audit_events (id uuid primary key default gen_random_uuid(), event_type text not null, payload jsonb not null default "{}"::jsonb, created_at timestamptz not null default now());
 create table if not exists undo_entries (id uuid primary key default gen_random_uuid(), audit_event_id uuid references audit_events(id), created_at timestamptz not null default now());
