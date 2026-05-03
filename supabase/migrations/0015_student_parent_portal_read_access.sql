drop policy if exists students_select_self_student on public.students;
create policy students_select_self_student on public.students
for select
using (
  exists (
    select 1
    from public.memberships m
    where m.profile_id = auth.uid()
      and m.organization_id = students.organization_id
      and m.school_id = students.school_id
      and m.status = 'active'
      and m.metadata->>'student_id' = students.id::text
  )
);

drop policy if exists students_select_linked_guardian on public.students;
create policy students_select_linked_guardian on public.students
for select
using (
  exists (
    select 1
    from public.student_guardians sg
    join public.guardians g on g.id = sg.guardian_id
    where sg.student_id = students.id
      and sg.organization_id = students.organization_id
      and sg.school_id = students.school_id
      and g.profile_id = auth.uid()
      and g.status = 'active'
  )
);

drop policy if exists guardians_select_self on public.guardians;
create policy guardians_select_self on public.guardians
for select
using (profile_id = auth.uid());

drop policy if exists student_guardians_select_linked_guardian on public.student_guardians;
create policy student_guardians_select_linked_guardian on public.student_guardians
for select
using (
  exists (
    select 1
    from public.guardians g
    where g.id = student_guardians.guardian_id
      and g.profile_id = auth.uid()
      and g.status = 'active'
  )
);

drop policy if exists homework_assignments_select_student_or_guardian on public.homework_assignments;
create policy homework_assignments_select_student_or_guardian on public.homework_assignments
for select
using (
  exists (
    select 1
    from public.students s
    where s.organization_id = homework_assignments.organization_id
      and s.school_id = homework_assignments.school_id
      and s.class_section_id = homework_assignments.class_section_id
      and (
        exists (
          select 1
          from public.memberships m
          where m.profile_id = auth.uid()
            and m.organization_id = s.organization_id
            and m.school_id = s.school_id
            and m.status = 'active'
            and m.metadata->>'student_id' = s.id::text
        )
        or exists (
          select 1
          from public.student_guardians sg
          join public.guardians g on g.id = sg.guardian_id
          where sg.student_id = s.id
            and sg.organization_id = s.organization_id
            and sg.school_id = s.school_id
            and g.profile_id = auth.uid()
            and g.status = 'active'
        )
      )
  )
);

drop policy if exists homework_submissions_select_student_or_guardian on public.homework_submissions;
create policy homework_submissions_select_student_or_guardian on public.homework_submissions
for select
using (
  exists (
    select 1
    from public.memberships m
    where m.profile_id = auth.uid()
      and m.organization_id = homework_submissions.organization_id
      and m.school_id = homework_submissions.school_id
      and m.status = 'active'
      and m.metadata->>'student_id' = homework_submissions.student_id::text
  )
  or exists (
    select 1
    from public.student_guardians sg
    join public.guardians g on g.id = sg.guardian_id
    where sg.student_id = homework_submissions.student_id
      and sg.organization_id = homework_submissions.organization_id
      and sg.school_id = homework_submissions.school_id
      and g.profile_id = auth.uid()
      and g.status = 'active'
  )
);

drop policy if exists attendance_records_select_student_or_guardian on public.attendance_records;
create policy attendance_records_select_student_or_guardian on public.attendance_records
for select
using (
  exists (
    select 1
    from public.memberships m
    where m.profile_id = auth.uid()
      and m.organization_id = attendance_records.organization_id
      and m.school_id = attendance_records.school_id
      and m.status = 'active'
      and m.metadata->>'student_id' = attendance_records.student_id::text
  )
  or exists (
    select 1
    from public.student_guardians sg
    join public.guardians g on g.id = sg.guardian_id
    where sg.student_id = attendance_records.student_id
      and sg.organization_id = attendance_records.organization_id
      and sg.school_id = attendance_records.school_id
      and g.profile_id = auth.uid()
      and g.status = 'active'
  )
);

do $$
declare
  target_student_id uuid;
  target_org_id uuid;
  target_school_id uuid;
  student_profile_id uuid;
  parent_profile_id uuid;
  parent_membership_id uuid;
  parent_role_id uuid;
  parent_guardian_id uuid;
begin
  select s.id, s.organization_id, s.school_id
    into target_student_id, target_org_id, target_school_id
  from public.students s
  order by s.created_at asc
  limit 1;

  if target_student_id is null then
    return;
  end if;

  select id into student_profile_id
  from public.profiles
  where lower(email) = 'student.test@vertexa.ai'
  limit 1;

  if student_profile_id is not null then
    update public.memberships
    set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('student_id', target_student_id::text),
        updated_at = now()
    where profile_id = student_profile_id
      and organization_id = target_org_id
      and school_id = target_school_id
      and status = 'active';
  end if;

  select id into parent_role_id from public.roles where key = 'parent' limit 1;

  select id into parent_profile_id
  from auth.users
  where lower(email) = 'parent.test@vertexa.ai'
  order by created_at asc
  limit 1;

  if parent_profile_id is null then
    parent_profile_id := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      confirmation_token, recovery_token, email_change_token_new, email_change_token_current, phone_change_token, reauthentication_token,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, is_sso_user, is_anonymous
    ) values (
      '00000000-0000-0000-0000-000000000000', parent_profile_id, 'authenticated', 'authenticated', 'parent.test@vertexa.ai',
      crypt('Test@12345', gen_salt('bf')), now(),
      '', '', '', '', '', '',
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('full_name', 'Test Parent'),
      false, now(), now(), false, false
    );

    update auth.users
    set email_change = coalesce(email_change, ''),
        phone_change = coalesce(phone_change, '')
    where id = parent_profile_id;

    insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (
      gen_random_uuid(), parent_profile_id::text, parent_profile_id,
      jsonb_build_object('sub', parent_profile_id::text, 'email', 'parent.test@vertexa.ai', 'email_verified', true, 'phone_verified', false),
      'email', null, now(), now()
    ) on conflict (provider_id, provider) do nothing;
  else
    update auth.users
    set encrypted_password = crypt('Test@12345', gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        confirmation_token = coalesce(confirmation_token, ''),
        recovery_token = coalesce(recovery_token, ''),
        email_change_token_new = coalesce(email_change_token_new, ''),
        email_change_token_current = coalesce(email_change_token_current, ''),
        email_change = coalesce(email_change, ''),
        phone_change = coalesce(phone_change, ''),
        phone_change_token = coalesce(phone_change_token, ''),
        reauthentication_token = coalesce(reauthentication_token, ''),
        updated_at = now()
    where id = parent_profile_id;
  end if;

  insert into public.profiles (id, full_name, email, status, metadata)
  values (parent_profile_id, 'Test Parent', 'parent.test@vertexa.ai', 'active', '{}'::jsonb)
  on conflict (id) do update
  set full_name = 'Test Parent', email = 'parent.test@vertexa.ai', status = 'active', updated_at = now();

  insert into public.memberships (organization_id, school_id, profile_id, status)
  values (target_org_id, target_school_id, parent_profile_id, 'active')
  on conflict (organization_id, school_id, profile_id) where (school_id is not null and campus_id is null)
  do update set status = 'active', updated_at = now()
  returning id into parent_membership_id;

  if parent_role_id is not null then
    insert into public.membership_roles (membership_id, role_id, organization_id, school_id)
    values (parent_membership_id, parent_role_id, target_org_id, target_school_id)
    on conflict (membership_id, role_id) do nothing;
  end if;

  insert into public.guardians (organization_id, school_id, profile_id, full_name, email, relationship_label, status)
  values (target_org_id, target_school_id, parent_profile_id, 'Test Parent', 'parent.test@vertexa.ai', 'Parent', 'active')
  on conflict do nothing;

  select id into parent_guardian_id
  from public.guardians
  where profile_id = parent_profile_id
    and organization_id = target_org_id
    and school_id = target_school_id
  order by created_at asc
  limit 1;

  if parent_guardian_id is not null then
    insert into public.student_guardians (organization_id, school_id, student_id, guardian_id, relationship, is_primary, receives_communications)
    values (target_org_id, target_school_id, target_student_id, parent_guardian_id, 'parent', true, true)
    on conflict do nothing;
  end if;
end $$;
