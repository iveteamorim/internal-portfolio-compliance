insert into roles (name) values ('admin'), ('operator'), ('viewer') on conflict do nothing;

insert into users (full_name, email) values
  ('Lucia Perez', 'lucia@example.com'),
  ('Bruno Diaz', 'bruno@example.com'),
  ('Camila Torres', 'camila@example.com'),
  ('Diego Ruiz', 'diego@example.com')
  on conflict do nothing;

insert into user_roles (user_id, role_id)
select u.id, r.id
from users u
join roles r on r.name = case
  when u.full_name = 'Lucia Perez' then 'admin'
  when u.full_name = 'Bruno Diaz' then 'operator'
  else 'viewer'
end
on conflict do nothing;

insert into portfolio_items (name, owner, status, markets)
select
  'Formula ' || series.i,
  (array['Alicia', 'Bruno', 'Camila', 'Diego'])[((series.i - 1) % 4) + 1],
  case
    when series.i % 4 = 1 then 'blocked'
    when series.i % 3 = 0 then 'draft'
    else 'active'
  end,
  case
    when series.i % 3 = 1 then array['EU']
    when series.i % 3 = 2 then array['EU', 'US']
    else array['EU', 'US', 'CA']
  end
from generate_series(1, 10) as series(i);

insert into documents (title, version, status, portfolio_item_id, uploaded_by, storage_url)
select
  'Stability Report ' || series.i,
  'v' || ((series.i - 1) % 3 + 1) || '.0',
  case
    when series.i % 5 = 0 then 'pending'
    when series.i % 4 = 0 then 'obsolete'
    else 'approved'
  end,
  (select id from portfolio_items order by created_at offset ((series.i - 1) % 10) limit 1),
  (select id from users order by created_at offset ((series.i - 1) % 4) limit 1),
  'https://storage.example.com/PI-' || (1000 + ((series.i - 1) % 10)) || '/doc-' || series.i
from generate_series(1, 30) as series(i);

insert into compliance_tasks (portfolio_item_id, market, requirement, status)
select
  (select id from portfolio_items order by created_at offset ((series.i - 1) % 10) limit 1),
  (array['EU', 'US', 'CA'])[((series.i - 1) % 3) + 1],
  (array[
    'Ingredient disclosure',
    'Label review',
    'Stability data',
    'Safety assessment',
    'Regulatory filing'
  ])[((series.i - 1) % 5) + 1],
  case
    when series.i % 6 = 0 then 'blocked'
    when series.i % 3 = 0 then 'done'
    else 'open'
  end
from generate_series(1, 40) as series(i);

insert into audit_events (actor_id, action, target_type, target_id, metadata)
values
  ((select id from users where full_name = 'Lucia Perez'), 'Approved document', 'document', (select id from documents limit 1), 'Version v2.0'),
  ((select id from users where full_name = 'Bruno Diaz'), 'Changed portfolio status', 'portfolio', (select id from portfolio_items limit 1), 'draft -> blocked'),
  ((select id from users where full_name = 'Lucia Perez'), 'Deleted document', 'document', (select id from documents offset 2 limit 1), 'Superseded');
