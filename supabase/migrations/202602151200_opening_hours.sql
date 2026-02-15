alter table practices
  add column if not exists opening_hours jsonb;

update practices
set opening_hours = jsonb_build_object(
  'monday',
  jsonb_build_object(
    'is_open',
    not ('monday' = any(coalesce(closed_days, '{}'::text[]))),
    'open_time',
    coalesce(to_char(opening_time, 'HH24:MI'), '09:00'),
    'close_time',
    coalesce(to_char(closing_time, 'HH24:MI'), '22:00')
  ),
  'tuesday',
  jsonb_build_object(
    'is_open',
    not ('tuesday' = any(coalesce(closed_days, '{}'::text[]))),
    'open_time',
    coalesce(to_char(opening_time, 'HH24:MI'), '09:00'),
    'close_time',
    coalesce(to_char(closing_time, 'HH24:MI'), '22:00')
  ),
  'wednesday',
  jsonb_build_object(
    'is_open',
    not ('wednesday' = any(coalesce(closed_days, '{}'::text[]))),
    'open_time',
    coalesce(to_char(opening_time, 'HH24:MI'), '09:00'),
    'close_time',
    coalesce(to_char(closing_time, 'HH24:MI'), '22:00')
  ),
  'thursday',
  jsonb_build_object(
    'is_open',
    not ('thursday' = any(coalesce(closed_days, '{}'::text[]))),
    'open_time',
    coalesce(to_char(opening_time, 'HH24:MI'), '09:00'),
    'close_time',
    coalesce(to_char(closing_time, 'HH24:MI'), '22:00')
  ),
  'friday',
  jsonb_build_object(
    'is_open',
    not ('friday' = any(coalesce(closed_days, '{}'::text[]))),
    'open_time',
    coalesce(to_char(opening_time, 'HH24:MI'), '09:00'),
    'close_time',
    coalesce(to_char(closing_time, 'HH24:MI'), '22:00')
  ),
  'saturday',
  jsonb_build_object(
    'is_open',
    not ('saturday' = any(coalesce(closed_days, '{}'::text[]))),
    'open_time',
    coalesce(to_char(opening_time, 'HH24:MI'), '09:00'),
    'close_time',
    coalesce(to_char(closing_time, 'HH24:MI'), '22:00')
  ),
  'sunday',
  jsonb_build_object(
    'is_open',
    not ('sunday' = any(coalesce(closed_days, '{}'::text[]))),
    'open_time',
    coalesce(to_char(opening_time, 'HH24:MI'), '09:00'),
    'close_time',
    coalesce(to_char(closing_time, 'HH24:MI'), '22:00')
  )
)
where opening_hours is null;

alter table practices
  alter column opening_hours
  set default '{
    "monday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "tuesday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "wednesday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "thursday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "friday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "saturday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "sunday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"}
  }'::jsonb;

update practices
set opening_hours = coalesce(
  opening_hours,
  '{
    "monday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "tuesday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "wednesday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "thursday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "friday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "saturday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"},
    "sunday": {"is_open": true, "open_time": "09:00", "close_time": "22:00"}
  }'::jsonb
)
where opening_hours is null;

alter table practices
  alter column opening_hours set not null;
