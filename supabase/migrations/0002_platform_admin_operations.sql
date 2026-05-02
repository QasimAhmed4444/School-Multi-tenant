-- Applied to project fsbcwjgnpvfigmomprhq through the Supabase connector.
-- Purpose:
-- 1. Add platform operation support for assigning an existing signed-up user
--    as a school admin.
-- 2. Keep privileged SECURITY DEFINER logic outside the exposed public API schema.
-- 3. Leave public RPC/helper functions as SECURITY INVOKER wrappers for Supabase clients.

create schema if not exists private;

do $$
begin
  if to_regprocedure('public.assign_school_admin_by_email(uuid,uuid,text)') is not null then
    alter function public.assign_school_admin_by_email(uuid, uuid, text) set schema private;
  end if;
  if to_regprocedure('public.is_platform_admin()') is not null then
    alter function public.is_platform_admin() set schema private;
  end if;
  if to_regprocedure('public.is_org_member(uuid)') is not null then
    alter function public.is_org_member(uuid) set schema private;
  end if;
  if to_regprocedure('public.is_school_member(uuid,uuid)') is not null then
    alter function public.is_school_member(uuid, uuid) set schema private;
  end if;
  if to_regprocedure('public.has_permission(uuid,uuid,text)') is not null then
    alter function public.has_permission(uuid, uuid, text) set schema private;
  end if;
end $$;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

revoke all on function private.assign_school_admin_by_email(uuid, uuid, text) from public, anon;
revoke all on function private.is_platform_admin() from public, anon;
revoke all on function private.is_org_member(uuid) from public, anon;
revoke all on function private.is_school_member(uuid, uuid) from public, anon;
revoke all on function private.has_permission(uuid, uuid, text) from public, anon;

grant execute on function private.assign_school_admin_by_email(uuid, uuid, text) to authenticated;
grant execute on function private.is_platform_admin() to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.is_school_member(uuid, uuid) to authenticated;
grant execute on function private.has_permission(uuid, uuid, text) to authenticated;

create or replace function public.assign_school_admin_by_email(org_id uuid, sch_id uuid, admin_email text)
returns void
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select private.assign_school_admin_by_email(org_id, sch_id, admin_email);
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security invoker
set search_path = public, private, pg_temp
as $$ select private.is_platform_admin(); $$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public, private, pg_temp
as $$ select private.is_org_member(org_id); $$;

create or replace function public.is_school_member(org_id uuid, sch_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public, private, pg_temp
as $$ select private.is_school_member(org_id, sch_id); $$;

create or replace function public.has_permission(org_id uuid, sch_id uuid, permission_key text)
returns boolean
language sql
stable
security invoker
set search_path = public, private, pg_temp
as $$ select private.has_permission(org_id, sch_id, permission_key); $$;

revoke all on function public.assign_school_admin_by_email(uuid, uuid, text) from public, anon;
revoke all on function public.is_platform_admin() from public, anon;
revoke all on function public.is_org_member(uuid) from public, anon;
revoke all on function public.is_school_member(uuid, uuid) from public, anon;
revoke all on function public.has_permission(uuid, uuid, text) from public, anon;

grant execute on function public.assign_school_admin_by_email(uuid, uuid, text) to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.is_school_member(uuid, uuid) to authenticated;
grant execute on function public.has_permission(uuid, uuid, text) to authenticated;
