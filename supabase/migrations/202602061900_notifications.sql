alter table practices
  add column if not exists email_notifications_enabled boolean not null default true;

create table if not exists notification_events (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references practices(id) on delete cascade,
  event_type text not null check (event_type in ('reservation_created', 'access_expiring_3d', 'call_limit_80')),
  dedupe_key text not null,
  recipient_email text not null,
  status text not null check (status in ('processing', 'sent', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (practice_id, event_type, dedupe_key)
);
