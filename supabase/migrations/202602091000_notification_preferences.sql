alter table practices
  add column if not exists notify_reservation_created boolean not null default true;

alter table practices
  add column if not exists notify_access_expiring_3d boolean not null default true;

alter table practices
  add column if not exists notify_call_limit_80 boolean not null default true;
