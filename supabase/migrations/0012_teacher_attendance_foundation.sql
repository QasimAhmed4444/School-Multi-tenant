insert into public.permissions (key, name, module, description)
values
  ('attendance.read', 'Read attendance', 'attendance', 'View attendance records'),
  ('attendance.manage', 'Manage attendance', 'attendance', 'Create and update attendance records'),
  ('homework.read', 'Read homework', 'homework', 'View homework assignments'),
  ('homework.manage', 'Manage homework', 'homework', 'Create and update homework assignments')
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key in ('organization_owner','school_owner','principal','school_admin')
  and p.key in ('attendance.read','attendance.manage','homework.read','homework.manage')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'teacher'
  and p.key in ('attendance.read','attendance.manage','homework.read','homework.manage','students.read','guardians.read')
on conflict do nothing;

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_section_id uuid not null references public.class_sections(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  teacher_membership_id uuid not null references public.memberships(id) on delete restrict,
  attendance_date date not null default current_date,
  status text not null default 'pending' check (status in ('pending','present','absent','late','excused')),
  time_in time,
  notes text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, student_id, attendance_date)
);

create index if not exists attendance_records_school_date_idx on public.attendance_records (school_id, attendance_date);
create index if not exists attendance_records_teacher_date_idx on public.attendance_records (teacher_membership_id, attendance_date);
create index if not exists attendance_records_class_date_idx on public.attendance_records (class_section_id, attendance_date);

create or replace trigger attendance_records_set_updated_at
before update on public.attendance_records
for each row execute function public.set_updated_at();

alter table public.attendance_records enable row level security;

drop policy if exists attendance_records_read on public.attendance_records;
create policy attendance_records_read on public.attendance_records
for select using (private.has_permission(organization_id, school_id, 'attendance.read'));

drop policy if exists attendance_records_insert on public.attendance_records;
create policy attendance_records_insert on public.attendance_records
for insert with check (private.has_permission(organization_id, school_id, 'attendance.manage'));

drop policy if exists attendance_records_update on public.attendance_records;
create policy attendance_records_update on public.attendance_records
for update using (private.has_permission(organization_id, school_id, 'attendance.manage'))
with check (private.has_permission(organization_id, school_id, 'attendance.manage'));
