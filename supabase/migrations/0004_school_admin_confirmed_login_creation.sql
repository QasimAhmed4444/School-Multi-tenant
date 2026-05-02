-- Applied to project fsbcwjgnpvfigmomprhq through the Supabase connector.
-- Testing purpose:
-- Platform Super Admin can create a confirmed school admin login with a temporary
-- password and assign the school_admin role immediately, avoiding email
-- confirmation while the product is still being tested.
--
-- Production note:
-- Replace this flow later with Supabase Admin API / Edge Function invitations and
-- forced password reset.

create or replace function private.create_school_admin_with_password(org_id uuid, sch_id uuid, admin_email text, admin_full_name text, admin_password text)
returns table (membership_id uuid, profile_id uuid)
language plpgsql
security definer
set search_path = public, auth, private, extensions, pg_temp
as $$
declare
  normalized_email text := lower(trim(admin_email));
  normalized_name text := nullif(trim(admin_full_name), '');
  target_profile_id uuid;
  target_membership_id uuid;
  school_admin_role_id uuid;
begin
  if not private.is_platform_admin() then
    raise exception 'Only platform admins can create school admin logins';
  end if;

  if normalized_email is null or normalized_email = '' then
    raise exception 'Admin email is required';
  end if;

  if admin_password is null or length(admin_password) < 8 then
    raise exception 'Admin password must be at least 8 characters';
  end if;

  select id into school_admin_role_id
  from public.roles
  where key = 'school_admin'
  limit 1;

  if school_admin_role_id is null then
    raise exception 'school_admin role does not exist';
  end if;

  select id into target_profile_id
  from auth.users
  where lower(email) = normalized_email
  order by created_at asc
  limit 1;

  if target_profile_id is null then
    target_profile_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000',
      target_profile_id,
      'authenticated',
      'authenticated',
      normalized_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('full_name', coalesce(normalized_name, normalized_email)),
      false,
      now(),
      now(),
      false,
      false
    );

    insert into auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      email
    ) values (
      target_profile_id,
      target_profile_id::text,
      target_profile_id,
      jsonb_build_object('sub', target_profile_id::text, 'email', normalized_email, 'email_verified', true, 'phone_verified', false),
      'email',
      null,
      now(),
      now(),
      normalized_email
    ) on conflict (provider_id, provider) do nothing;
  else
    update auth.users
    set encrypted_password = crypt(admin_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmed_at = coalesce(confirmed_at, now()),
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', coalesce(normalized_name, normalized_email)),
        updated_at = now()
    where id = target_profile_id;

    insert into auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      created_at,
      updated_at,
      email
    ) values (
      target_profile_id,
      target_profile_id::text,
      target_profile_id,
      jsonb_build_object('sub', target_profile_id::text, 'email', normalized_email, 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      normalized_email
    ) on conflict (provider_id, provider) do update
    set email = excluded.email,
        identity_data = excluded.identity_data,
        updated_at = now();
  end if;

  insert into public.profiles (id, full_name, email, status, metadata)
  values (target_profile_id, coalesce(normalized_name, normalized_email), normalized_email, 'active', '{}'::jsonb)
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, public.profiles.full_name),
      email = excluded.email,
      status = 'active',
      updated_at = now();

  insert into public.memberships (organization_id, school_id, profile_id, status)
  values (org_id, sch_id, target_profile_id, 'active')
  on conflict (organization_id, school_id, profile_id)
  do update set status = 'active', updated_at = now()
  returning id into target_membership_id;

  insert into public.membership_roles (membership_id, role_id)
  values (target_membership_id, school_admin_role_id)
  on conflict do nothing;

  insert into public.audit_logs (organization_id, school_id, actor_profile_id, action, entity_type, entity_id, metadata)
  values (
    org_id,
    sch_id,
    auth.uid(),
    'platform.school_admin.created_login',
    'membership',
    target_membership_id,
    jsonb_build_object('admin_email', normalized_email)
  );

  membership_id := target_membership_id;
  profile_id := target_profile_id;
  return next;
end;
$$;

revoke all on function private.create_school_admin_with_password(uuid, uuid, text, text, text) from public, anon;
grant execute on function private.create_school_admin_with_password(uuid, uuid, text, text, text) to authenticated;

create or replace function public.create_school_admin_with_password(org_id uuid, sch_id uuid, admin_email text, admin_full_name text, admin_password text)
returns table (membership_id uuid, profile_id uuid)
language sql
security invoker
set search_path = public, private, pg_temp
as $$
  select * from private.create_school_admin_with_password(org_id, sch_id, admin_email, admin_full_name, admin_password);
$$;

revoke all on function public.create_school_admin_with_password(uuid, uuid, text, text, text) from public, anon;
grant execute on function public.create_school_admin_with_password(uuid, uuid, text, text, text) to authenticated;
