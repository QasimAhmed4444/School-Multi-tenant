-- Applied to project fsbcwjgnpvfigmomprhq through the Supabase connector.
-- Purpose:
-- 1. Add school-scoped academic setup tables for the first real tenant workspace.
-- 2. Add RBAC permissions for academic setup management.
-- 3. Add a safe school-admin RPC for assigning existing signed-up users to a school.

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  status text not null default 'planned' check (status in ('planned', 'active', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_years_date_order check (ends_on > starts_on),
  constraint academic_years_school_name_unique unique (school_id, name)
);

create table if not exists public.grade_levels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text not null,
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint grade_levels_school_code_unique unique (school_id, code)
);

create table if not exists public.class_sections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  grade_level_id uuid not null references public.grade_levels(id) on delete cascade,
  name text not null,
  code text not null,
  capacity integer check (capacity is null or capacity > 0),
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint class_sections_school_code_unique unique (school_id, code)
);

create index if not exists academic_years_tenant_idx on public.academic_years (organization_id, school_id);
create index if not exists grade_levels_tenant_idx on public.grade_levels (organization_id, school_id);
create index if not exists class_sections_tenant_idx on public.class_sections (organization_id, school_id);
create index if not exists class_sections_grade_level_idx on public.class_sections (grade_level_id);

drop trigger if exists set_academic_years_updated_at on public.academic_years;
create trigger set_academic_years_updated_at
before update on public.academic_years
for each row execute function public.set_updated_at();

drop trigger if exists set_grade_levels_updated_at on public.grade_levels;
create trigger set_grade_levels_updated_at
before update on public.grade_levels
for each row execute function public.set_updated_at();

drop trigger if exists set_class_sections_updated_at on public.class_sections;
create trigger set_class_sections_updated_at
before update on public.class_sections
for each row execute function public.set_updated_at();

alter table public.academic_years enable row level security;
alter table public.grade_levels enable row level security;
alter table public.class_sections enable row level security;

insert into public.permissions (key, name, module)
values
  ('academics.read', 'Read academic setup', 'academics'),
  ('academics.manage', 'Manage academic setup', 'academics')
on conflict (key) do update
set name = excluded.name,
    module = excluded.module;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('academics.read', 'academics.manage')
where r.key in ('organization_owner', 'school_owner', 'principal', 'school_admin')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = 'academics.read'
where r.key = 'teacher'
on conflict do nothing;

drop policy if exists academic_years_select on public.academic_years;
create policy academic_years_select on public.academic_years
for select to authenticated
using (private.is_school_member(organization_id, school_id));

drop policy if exists academic_years_insert on public.academic_years;
create policy academic_years_insert on public.academic_years
for insert to authenticated
with check (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'));

drop policy if exists academic_years_update on public.academic_years;
create policy academic_years_update on public.academic_years
for update to authenticated
using (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'))
with check (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'));

drop policy if exists academic_years_delete on public.academic_years;
create policy academic_years_delete on public.academic_years
for delete to authenticated
using (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'));

drop policy if exists grade_levels_select on public.grade_levels;
create policy grade_levels_select on public.grade_levels
for select to authenticated
using (private.is_school_member(organization_id, school_id));

drop policy if exists grade_levels_insert on public.grade_levels;
create policy grade_levels_insert on public.grade_levels
for insert to authenticated
with check (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'));

drop policy if exists grade_levels_update on public.grade_levels;
create policy grade_levels_update on public.grade_levels
for update to authenticated
using (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'))
with check (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'));

drop policy if exists grade_levels_delete on public.grade_levels;
create policy grade_levels_delete on public.grade_levels
for delete to authenticated
using (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'));

drop policy if exists class_sections_select on public.class_sections;
create policy class_sections_select on public.class_sections
for select to authenticated
using (private.is_school_member(organization_id, school_id));

drop policy if exists class_sections_insert on public.class_sections;
create policy class_sections_insert on public.class_sections
for insert to authenticated
with check (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'));

drop policy if exists class_sections_update on public.class_sections;
create policy class_sections_update on public.class_sections
for update to authenticated
using (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'))
with check (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'));

drop policy if exists class_sections_delete on public.class_sections;
create policy class_sections_delete on public.class_sections
for delete to authenticated
using (private.is_platform_admin() or private.has_permission(organization_id, school_id, 'academics.manage'));

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
for select to authenticated
using (
  id = auth.uid()
  or private.is_platform_admin()
  or exists (
    select 1
    from public.memberships viewer_membership
    join public.memberships target_membership
      on target_membership.organization_id = viewer_membership.organization_id
    where viewer_membership.profile_id = auth.uid()
      and target_membership.profile_id = profiles.id
      and viewer_membership.status = 'active'
      and target_membership.status = 'active'
  )
);

create or replace function private.assign_school_user_by_email(org_id uuid, sch_id uuid, user_email text, role_key text)
returns table (membership_id uuid, profile_id uuid)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  target_profile_id uuid;
  target_membership_id uuid;
  target_role_id uuid;
begin
  if not private.is_platform_admin()
    and not private.has_permission(org_id, sch_id, 'users.invite') then
    raise exception 'Not allowed to assign users for this school';
  end if;

  if role_key not in ('teacher', 'accountant', 'parent') then
    raise exception 'Role % cannot be assigned from school admin workspace', role_key;
  end if;

  select id into target_profile_id
  from public.profiles
  where lower(email) = lower(trim(user_email))
  limit 1;

  if target_profile_id is null then
    raise exception 'No signed-up profile found for %', user_email;
  end if;

  select id into target_role_id
  from public.roles
  where key = role_key
  limit 1;

  if target_role_id is null then
    raise exception 'Role % does not exist', role_key;
  end if;

  insert into public.memberships (organization_id, school_id, profile_id, status)
  values (org_id, sch_id, target_profile_id, 'active')
  on conflict (organization_id, school_id, profile_id)
  do update set status = 'active', updated_at = now()
  returning id into target_membership_id;

  insert into public.membership_roles (membership_id, role_id)
  values (target_membership_id, target_role_id)
  on conflict do nothing;

  insert into public.audit_logs (organization_id, school_id, actor_profile_id, action, entity_type, entity_id, metadata)
  values (
    org_id,
    sch_id,
    auth.uid(),
    'school.user.assigned',
    'membership',
    target_membership_id,
    jsonb_build_object('assigned_email', lower(trim(user_email)), 'role_key', role_key)
  );

  membership_id := target_membership_id;
  profile_id := target_profile_id;
  return next;
end;
$$;

revoke all on function private.assign_school_user_by_email(uuid, uuid, text, text) from public, anon;
grant execute on function private.assign_school_user_by_email(uuid, uuid, text, text) to authenticated;

create or replace function public.assign_school_user_by_email(org_id uuid, sch_id uuid, user_email text, role_key text)
returns table (membership_id uuid, profile_id uuid)
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select * from private.assign_school_user_by_email(org_id, sch_id, user_email, role_key);
$$;

revoke all on function public.assign_school_user_by_email(uuid, uuid, text, text) from public, anon;
grant execute on function public.assign_school_user_by_email(uuid, uuid, text, text) to authenticated;
