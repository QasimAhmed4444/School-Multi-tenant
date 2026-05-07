create or replace function private.create_school_user_with_password(
  org_id uuid,
  sch_id uuid,
  user_email text,
  user_full_name text,
  user_password text,
  role_key text
)
returns table (created_membership_id uuid, created_profile_id uuid)
language plpgsql
security definer
set search_path to 'public', 'auth', 'private', 'extensions', 'pg_temp'
as $$
declare
  normalized_email text := lower(trim(user_email));
  normalized_name text := nullif(trim(user_full_name), '');
  normalized_role_key text := lower(trim(role_key));
  target_profile_id uuid;
  target_membership_id uuid;
  target_role_id uuid;
  target_school_exists boolean;
begin
  if not private.is_platform_admin() then
    raise exception 'Only platform admins can create confirmed school logins';
  end if;

  if normalized_role_key not in ('school_admin', 'teacher', 'accountant', 'parent', 'student') then
    raise exception 'Unsupported login role: %', normalized_role_key;
  end if;

  if normalized_email is null or normalized_email = '' then
    raise exception 'User email is required';
  end if;

  if user_password is null or length(user_password) < 8 then
    raise exception 'Password must be at least 8 characters';
  end if;

  select exists(select 1 from public.schools where id = sch_id and organization_id = org_id and status = 'active') into target_school_exists;
  if not target_school_exists then
    raise exception 'School does not belong to the selected organization';
  end if;

  select id into target_role_id from public.roles where key = normalized_role_key limit 1;
  if target_role_id is null then
    raise exception 'Role does not exist: %', normalized_role_key;
  end if;

  select id into target_profile_id from auth.users where lower(email) = normalized_email order by created_at asc limit 1;

  if target_profile_id is null then
    target_profile_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current,
      email_change, phone_change, phone_change_token, reauthentication_token,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000', target_profile_id, 'authenticated', 'authenticated', normalized_email,
      crypt(user_password, gen_salt('bf')), now(),
      '', '', '', '',
      '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('full_name', coalesce(normalized_name, normalized_email)),
      false, now(), now(), false, false
    );

    insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), target_profile_id::text, target_profile_id,
      jsonb_build_object('sub', target_profile_id::text, 'email', normalized_email, 'email_verified', true, 'phone_verified', false),
      'email', null, now(), now()
    ) on conflict (provider_id, provider) do nothing;
  else
    update auth.users
    set encrypted_password = crypt(user_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmation_token = coalesce(confirmation_token, ''),
        recovery_token = coalesce(recovery_token, ''),
        email_change_token_new = coalesce(email_change_token_new, ''),
        email_change_token_current = coalesce(email_change_token_current, ''),
        email_change = coalesce(email_change, ''),
        phone_change = coalesce(phone_change, ''),
        phone_change_token = coalesce(phone_change_token, ''),
        reauthentication_token = coalesce(reauthentication_token, ''),
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', coalesce(normalized_name, normalized_email)),
        updated_at = now()
    where id = target_profile_id;

    insert into auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
    values (
      gen_random_uuid(), target_profile_id::text, target_profile_id,
      jsonb_build_object('sub', target_profile_id::text, 'email', normalized_email, 'email_verified', true, 'phone_verified', false),
      'email', now(), now()
    ) on conflict (provider_id, provider) do update
    set identity_data = excluded.identity_data, updated_at = now();
  end if;

  insert into public.profiles (id, full_name, email, status, metadata)
  values (target_profile_id, coalesce(normalized_name, normalized_email), normalized_email, 'active', '{}'::jsonb)
  on conflict (id) do update
  set full_name = coalesce(excluded.full_name, public.profiles.full_name), email = excluded.email, status = 'active', updated_at = now();

  insert into public.memberships (organization_id, school_id, profile_id, status)
  values (org_id, sch_id, target_profile_id, 'active')
  on conflict (organization_id, school_id, profile_id) where (school_id is not null and campus_id is null)
  do update set status = 'active', updated_at = now()
  returning id into target_membership_id;

  insert into public.membership_roles (membership_id, role_id, organization_id, school_id)
  values (target_membership_id, target_role_id, org_id, sch_id)
  on conflict (membership_id, role_id) do nothing;

  insert into public.audit_logs (organization_id, school_id, actor_profile_id, action, entity_type, entity_id, metadata)
  values (org_id, sch_id, auth.uid(), 'platform.school_user.created_login', 'membership', target_membership_id, jsonb_build_object('email', normalized_email, 'role_key', normalized_role_key));

  created_membership_id := target_membership_id;
  created_profile_id := target_profile_id;
  return next;
end;
$$;

create or replace function public.create_school_user_with_password(
  org_id uuid,
  sch_id uuid,
  user_email text,
  user_full_name text,
  user_password text,
  role_key text
)
returns table (created_membership_id uuid, created_profile_id uuid)
language sql
security definer
set search_path to 'public', 'private', 'pg_temp'
as $$
  select * from private.create_school_user_with_password(org_id, sch_id, user_email, user_full_name, user_password, role_key);
$$;

revoke all on function public.create_school_user_with_password(uuid, uuid, text, text, text, text) from public;
grant execute on function public.create_school_user_with_password(uuid, uuid, text, text, text, text) to authenticated;
