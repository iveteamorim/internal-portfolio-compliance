-- Snapshot of core schema. For incremental changes use db/migrations/*.sql

create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique check (name in ('admin', 'operator', 'viewer'))
);

create table user_roles (
  user_id uuid references users(id) on delete cascade,
  role_id uuid references roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner text not null,
  status text not null check (status in ('draft', 'active', 'blocked', 'archived')),
  markets text[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  version text not null,
  status text not null check (status in ('pending', 'approved', 'obsolete')),
  portfolio_item_id uuid not null references portfolio_items(id) on delete cascade,
  uploaded_by uuid references users(id),
  uploaded_at timestamptz not null default now(),
  storage_url text not null
);

create table compliance_tasks (
  id uuid primary key default uuid_generate_v4(),
  portfolio_item_id uuid not null references portfolio_items(id) on delete cascade,
  market text not null check (market in ('EU', 'US', 'CA')),
  requirement text not null,
  status text not null check (status in ('open', 'done', 'blocked')),
  created_at timestamptz not null default now()
);

create table audit_events (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references users(id),
  action text not null,
  target_type text not null check (target_type in ('document', 'portfolio', 'task')),
  target_id uuid not null,
  metadata text,
  created_at timestamptz not null default now()
);

create index idx_documents_portfolio on documents(portfolio_item_id);
create index idx_tasks_portfolio on compliance_tasks(portfolio_item_id);
create index idx_audit_target on audit_events(target_type, target_id);
