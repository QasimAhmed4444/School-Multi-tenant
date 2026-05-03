delete from public.role_permissions rp
using public.roles r, public.permissions p
where rp.role_id = r.id
  and rp.permission_id = p.id
  and r.key = 'teacher'
  and p.key in ('attendance.read', 'attendance.manage', 'students.read', 'guardians.read');

drop policy if exists attendance_records_read on public.attendance_records;
drop policy if exists attendance_records_insert on public.attendance_records;
drop policy if exists attendance_records_update on public.attendance_records;

create policy attendance_records_read on public.attendance_records
for select using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'attendance.read')
  or exists (
    select 1
    from public.memberships m
    where m.id = attendance_records.teacher_membership_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

create policy attendance_records_insert on public.attendance_records
for insert with check (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'attendance.manage')
  or exists (
    select 1
    from public.memberships m
    where m.id = attendance_records.teacher_membership_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

create policy attendance_records_update on public.attendance_records
for update using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'attendance.manage')
  or exists (
    select 1
    from public.memberships m
    where m.id = attendance_records.teacher_membership_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
) with check (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'attendance.manage')
  or exists (
    select 1
    from public.memberships m
    where m.id = attendance_records.teacher_membership_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists students_select on public.students;
create policy students_select on public.students
for select using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'students.read')
  or private.has_permission(organization_id, school_id, 'students.manage')
  or exists (
    select 1
    from public.teacher_assignments ta
    join public.memberships m on m.id = ta.teacher_membership_id
    where ta.organization_id = students.organization_id
      and ta.school_id = students.school_id
      and ta.class_section_id = students.class_section_id
      and ta.status = 'active'
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists student_guardians_select on public.student_guardians;
create policy student_guardians_select on public.student_guardians
for select using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'students.read')
  or private.has_permission(organization_id, school_id, 'guardians.read')
  or private.has_permission(organization_id, school_id, 'students.manage')
  or exists (
    select 1
    from public.students s
    join public.teacher_assignments ta on ta.class_section_id = s.class_section_id
      and ta.organization_id = s.organization_id
      and ta.school_id = s.school_id
    join public.memberships m on m.id = ta.teacher_membership_id
    where s.id = student_guardians.student_id
      and ta.status = 'active'
      and m.profile_id = auth.uid()
      and m.status = 'active'
  )
);

drop policy if exists guardians_select on public.guardians;
create policy guardians_select on public.guardians
for select using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'guardians.read')
  or private.has_permission(organization_id, school_id, 'guardians.manage')
  or exists (
    select 1
    from public.student_guardians sg
    join public.students s on s.id = sg.student_id
    join public.teacher_assignments ta on ta.class_section_id = s.class_section_id
      and ta.organization_id = s.organization_id
      and ta.school_id = s.school_id
    join public.memberships m on m.id = ta.teacher_membership_id
    where sg.guardian_id = guardians.id
      and ta.status = 'active'
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
      and tablename = 'attendance_records'
  ) then
    alter publication supabase_realtime add table public.attendance_records;
  end if;
end $$;
