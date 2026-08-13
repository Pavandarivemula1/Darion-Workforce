create extension if not exists "pgcrypto";

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_id text unique not null,
  full_name text not null,
  role text not null,
  department text not null,
  employment_type text,
  joining_date date,
  status text not null default 'Active' check (
    status in ('Active', 'Intern', 'Probation', 'Suspended', 'Exited', 'Expired ID', 'Under Review')
  ),
  photo_url text,
  verification_token text unique not null,
  complete_verification_secret text unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.employees
add column if not exists complete_verification_secret text unique;

create table if not exists public.verification_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  scanned_at timestamp with time zone default now(),
  result text not null,
  ip_address text,
  device_info text
);

create table if not exists public.employee_activity_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references public.employees(id) on delete set null,
  created_at timestamp with time zone default now(),
  action text not null,
  details text,
  actor_id uuid
);

create index if not exists employees_status_idx on public.employees(status);
create index if not exists employees_verification_token_idx on public.employees(verification_token);
create index if not exists verification_logs_employee_id_idx on public.verification_logs(employee_id);
create index if not exists verification_logs_scanned_at_idx on public.verification_logs(scanned_at desc);
create index if not exists employee_activity_logs_employee_id_idx on public.employee_activity_logs(employee_id);
create index if not exists employee_activity_logs_created_at_idx on public.employee_activity_logs(created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_employees_updated_at on public.employees;
create trigger set_employees_updated_at
before update on public.employees
for each row
execute function public.set_updated_at();

alter table public.employees enable row level security;
alter table public.verification_logs enable row level security;
alter table public.employee_activity_logs enable row level security;

drop policy if exists "Authenticated admins can manage employees" on public.employees;
create policy "Authenticated admins can manage employees"
on public.employees
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins can read logs" on public.verification_logs;
create policy "Authenticated admins can read logs"
on public.verification_logs
for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can insert logs" on public.verification_logs;
create policy "Authenticated admins can insert logs"
on public.verification_logs
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can read employee activity logs" on public.employee_activity_logs;
create policy "Authenticated admins can read employee activity logs"
on public.employee_activity_logs
for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can insert employee activity logs" on public.employee_activity_logs;
create policy "Authenticated admins can insert employee activity logs"
on public.employee_activity_logs
for insert
to authenticated
with check (true);

-- Public verification is served through Next.js API routes using the service role key.
-- Do not add anonymous table read policies unless you intentionally want direct public DB access.

insert into storage.buckets (id, name, public)
values ('employee-photos', 'employee-photos', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated admins can upload employee photos" on storage.objects;
create policy "Authenticated admins can upload employee photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'employee-photos');

drop policy if exists "Authenticated admins can update employee photos" on storage.objects;
create policy "Authenticated admins can update employee photos"
on storage.objects
for update
to authenticated
using (bucket_id = 'employee-photos')
with check (bucket_id = 'employee-photos');

drop policy if exists "Employee photos are publicly readable" on storage.objects;
create policy "Employee photos are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'employee-photos');
