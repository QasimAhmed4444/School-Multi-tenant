create table if not exists public.homework_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  class_section_id uuid not null references public.class_sections(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  teacher_membership_id uuid not null references public.memberships(id) on delete restrict,
  title text not null,
  instructions text,
  assigned_date date not null default current_date,
  due_date date not null,
  status text not null default 'active' check (status in ('draft','active','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.homework_submissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  assignment_id uuid not null references public.homework_assignments(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','submitted','late','missing','excused')),
  submitted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists homework_assignments_school_idx on public.homework_assignments (school_id, status, due_date);
create index if not exists homework_assignments_teacher_idx on public.homework_assignments (teacher_membership_id, due_date);
create index if not exists homework_assignments_class_idx on public.homework_assignments (class_section_id, due_date);
create index if not exists homework_submissions_assignment_idx on public.homework_submissions (assignment_id, status);
create index if not exists homework_submissions_student_idx on public.homework_submissions (student_id, status);

create or replace trigger homework_assignments_set_updated_at
before update on public.homework_assignments
for each row execute function public.set_updated_at();

create or replace trigger homework_submissions_set_updated_at
before update on public.homework_submissions
for each row execute function public.set_updated_at();

alter table public.homework_assignments enable row level security;
alter table public.homework_submissions enable row level security;

delete from public.role_permissions rp
using public.roles r, public.permissions p
where rp.role_id = r.id
  and rp.permission_id = p.id
  and r.key = 'teacher'
  and p.key in ('homework.read', 'homework.manage');

drop policy if exists homework_assignments_select on public.homework_assignments;
create policy homework_assignments_select on public.homework_assignments
for select using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'homework.read')
  or private.has_permission(organization_id, school_id, 'homework.manage')
  or exists (
    select 1 from public.memberships m
    where m.id = homework_assignments.teacher_membership_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
  or exists (
    select 1
    from public.teacher_assignments ta
    join public.memberships m on m.id = ta.teacher_membership_id
    where ta.organization_id = homework_assignments.organization_id
      and ta.school_id = homework_assignments.school_id
      and ta.class_section_id = homework_assignments.class_section_id
      and ta.status = 'active'
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists homework_assignments_insert on public.homework_assignments;
create policy homework_assignments_insert on public.homework_assignments
for insert with check (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'homework.manage')
  or exists (
    select 1
    from public.teacher_assignments ta
    join public.memberships m on m.id = ta.teacher_membership_id
    where ta.organization_id = homework_assignments.organization_id
      and ta.school_id = homework_assignments.school_id
      and ta.class_section_id = homework_assignments.class_section_id
      and ta.teacher_membership_id = homework_assignments.teacher_membership_id
      and ta.status = 'active'
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists homework_assignments_update on public.homework_assignments;
create policy homework_assignments_update on public.homework_assignments
for update using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'homework.manage')
  or exists (
    select 1 from public.memberships m
    where m.id = homework_assignments.teacher_membership_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
) with check (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'homework.manage')
  or exists (
    select 1 from public.memberships m
    where m.id = homework_assignments.teacher_membership_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists homework_submissions_select on public.homework_submissions;
create policy homework_submissions_select on public.homework_submissions
for select using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'homework.read')
  or private.has_permission(organization_id, school_id, 'homework.manage')
  or exists (
    select 1
    from public.homework_assignments ha
    join public.memberships m on m.id = ha.teacher_membership_id
    where ha.id = homework_submissions.assignment_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists homework_submissions_insert on public.homework_submissions;
create policy homework_submissions_insert on public.homework_submissions
for insert with check (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'homework.manage')
  or exists (
    select 1
    from public.homework_assignments ha
    join public.memberships m on m.id = ha.teacher_membership_id
    where ha.id = homework_submissions.assignment_id
      and ha.organization_id = homework_submissions.organization_id
      and ha.school_id = homework_submissions.school_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists homework_submissions_update on public.homework_submissions;
create policy homework_submissions_update on public.homework_submissions
for update using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'homework.manage')
  or exists (
    select 1
    from public.homework_assignments ha
    join public.memberships m on m.id = ha.teacher_membership_id
    where ha.id = homework_submissions.assignment_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
) with check (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'homework.manage')
  or exists (
    select 1
    from public.homework_assignments ha
    join public.memberships m on m.id = ha.teacher_membership_id
    where ha.id = homework_submissions.assignment_id
      and ha.organization_id = homework_submissions.organization_id
      and ha.school_id = homework_submissions.school_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'homework_assignments'
  ) then
    alter publication supabase_realtime add table public.homework_assignments;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'homework_submissions'
  ) then
    alter publication supabase_realtime add table public.homework_submissions;
  end if;
end $$;
