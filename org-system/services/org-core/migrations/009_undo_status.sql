alter table undo_entries add column if not exists status text not null default 'pending';
alter table undo_entries add column if not exists applied_at timestamptz null;
