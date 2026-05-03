create or replace function private.is_self_student(stu_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'private', 'pg_temp'
as $$
  select exists (
    select 1
    from public.students s
    join public.memberships m on m.organization_id = s.organization_id and m.school_id = s.school_id
    where s.id = stu_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
      and m.metadata->>'student_id' = s.id::text
  );
$$;

create or replace function private.is_guardian_for_student(stu_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'private', 'pg_temp'
as $$
  select exists (
    select 1
    from public.student_guardians sg
    join public.guardians g on g.id = sg.guardian_id
    where sg.student_id = stu_id
      and g.profile_id = auth.uid()
      and g.status = 'active'
  );
$$;

create or replace function private.is_teacher_for_student(stu_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'private', 'pg_temp'
as $$
  select exists (
    select 1
    from public.students s
    join public.teacher_assignments ta on ta.organization_id = s.organization_id
      and ta.school_id = s.school_id
      and ta.class_section_id = s.class_section_id
      and ta.status = 'active'
    join public.memberships m on m.id = ta.teacher_membership_id
    where s.id = stu_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function private.is_teacher_for_guardian(guardian_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public', 'private', 'pg_temp'
as $$
  select exists (
    select 1
    from public.student_guardians sg
    where sg.guardian_id = guardian_uuid
      and private.is_teacher_for_student(sg.student_id)
  );
$$;

drop policy if exists students_select_self_student on public.students;
create policy students_select_self_student on public.students
for select
using (private.is_self_student(id));

drop policy if exists students_select_linked_guardian on public.students;
create policy students_select_linked_guardian on public.students
for select
using (private.is_guardian_for_student(id));

drop policy if exists student_guardians_select on public.student_guardians;
create policy student_guardians_select on public.student_guardians
for select
using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'students.read')
  or private.has_permission(organization_id, school_id, 'guardians.read')
  or private.has_permission(organization_id, school_id, 'students.manage')
  or private.is_teacher_for_student(student_id)
  or private.is_guardian_for_student(student_id)
);

drop policy if exists guardians_select on public.guardians;
create policy guardians_select on public.guardians
for select
using (
  private.is_platform_admin()
  or private.has_permission(organization_id, school_id, 'guardians.read')
  or private.has_permission(organization_id, school_id, 'guardians.manage')
  or profile_id = auth.uid()
  or private.is_teacher_for_guardian(id)
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
      and (private.is_self_student(s.id) or private.is_guardian_for_student(s.id))
  )
);

drop policy if exists homework_submissions_select_student_or_guardian on public.homework_submissions;
create policy homework_submissions_select_student_or_guardian on public.homework_submissions
for select
using (
  private.is_self_student(student_id)
  or private.is_guardian_for_student(student_id)
);

drop policy if exists attendance_records_select_student_or_guardian on public.attendance_records;
create policy attendance_records_select_student_or_guardian on public.attendance_records
for select
using (
  private.is_self_student(student_id)
  or private.is_guardian_for_student(student_id)
);
