import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays, FilePlus2, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/domains/authz/usePermissions";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type HomeworkStatus = "draft" | "active" | "completed" | "archived";
type Section = { id: string; name: string; code: string; grade_level?: { name: string } | null };
type Subject = { id: string; name: string; code: string };
type TeacherOption = { id: string; label: string };
type AssignmentRow = {
  id: string;
  title: string;
  instructions: string | null;
  assigned_date: string;
  due_date: string;
  status: HomeworkStatus;
  class_section_id: string;
  subject_id: string | null;
  teacher_membership_id: string;
  className: string;
  classCode: string;
  subjectName: string;
  teacherName: string;
  total: number;
  submitted: number;
  pending: number;
};

const statusFilters = ["all", "active", "completed", "draft"] as const;
const emptyForm = {
  title: "",
  instructions: "",
  classSectionId: "",
  subjectId: "",
  teacherMembershipId: "",
  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
};

export const HomeworkPage: React.FC = () => {
  const { selectedMembership } = useTenant();
  const { roleKeys, hasPermission } = usePermissions();
  const isTeacherOnly = roleKeys.includes("teacher") && !roleKeys.some((role) => ["school_admin", "principal", "school_owner", "organization_owner"].includes(role));
  const canManage = hasPermission("homework.manage");
  const [assignments, setAssignments] = React.useState<AssignmentRow[]>([]);
  const [sections, setSections] = React.useState<Section[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [teachers, setTeachers] = React.useState<TeacherOption[]>([]);
  const [form, setForm] = React.useState(emptyForm);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<(typeof statusFilters)[number]>("all");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const tenantScope = React.useMemo(() => {
    if (!selectedMembership?.organization_id || !selectedMembership.school_id) return null;
    return { organization_id: selectedMembership.organization_id, school_id: selectedMembership.school_id };
  }, [selectedMembership]);

  const loadHomework = React.useCallback(async () => {
    if (!tenantScope || !selectedMembership?.id) return;
    setLoading(true);
    setError(null);

    const assignedClassIds = isTeacherOnly
      ? ((await supabase
          .from("teacher_assignments")
          .select("class_section_id")
          .eq("organization_id", tenantScope.organization_id)
          .eq("school_id", tenantScope.school_id)
          .eq("teacher_membership_id", selectedMembership.id)
          .eq("status", "active")).data ?? [])
          .map((row) => row.class_section_id)
          .filter(Boolean)
      : [];

    let sectionsQuery = supabase
      .from("class_sections")
      .select("id,name,code,grade_level:grade_levels(name)")
      .eq("organization_id", tenantScope.organization_id)
      .eq("school_id", tenantScope.school_id)
      .eq("status", "active")
      .order("name", { ascending: true });

    let assignmentsQuery = supabase
      .from("homework_assignments")
      .select("id,title,instructions,assigned_date,due_date,status,class_section_id,subject_id,teacher_membership_id,class_section:class_sections(name,code),subject:subjects(name),teacher:memberships!homework_assignments_teacher_membership_id_fkey(profile:profiles!memberships_profile_id_fkey(full_name,email)),submissions:homework_submissions(status)")
      .eq("organization_id", tenantScope.organization_id)
      .eq("school_id", tenantScope.school_id)
      .order("due_date", { ascending: true });

    if (isTeacherOnly) {
      if (assignedClassIds.length === 0) {
        setAssignments([]);
        setSections([]);
        setLoading(false);
        return;
      }
      sectionsQuery = sectionsQuery.in("id", assignedClassIds);
      assignmentsQuery = assignmentsQuery.eq("teacher_membership_id", selectedMembership.id);
    }

    const [sectionsResult, subjectsResult, teachersResult, assignmentsResult] = await Promise.all([
      sectionsQuery,
      supabase
        .from("subjects")
        .select("id,name,code")
        .eq("organization_id", tenantScope.organization_id)
        .eq("school_id", tenantScope.school_id)
        .eq("status", "active")
        .order("name", { ascending: true }),
      supabase
        .from("memberships")
        .select("id,profile:profiles!memberships_profile_id_fkey(full_name,email),membership_roles(role:roles!membership_roles_role_id_fkey(key))")
        .eq("organization_id", tenantScope.organization_id)
        .eq("school_id", tenantScope.school_id)
        .eq("status", "active")
        .order("created_at", { ascending: true }),
      assignmentsQuery,
    ]);

    const firstError = sectionsResult.error ?? subjectsResult.error ?? teachersResult.error ?? assignmentsResult.error;
    if (firstError) {
      setError(firstError.message);
      setAssignments([]);
    } else {
      const nextSections = (sectionsResult.data ?? []) as unknown as Section[];
      const nextSubjects = (subjectsResult.data ?? []) as Subject[];
      const nextTeachers = ((teachersResult.data ?? []) as any[])
        .filter((membership) => (membership.membership_roles ?? []).some((item: any) => item.role?.key === "teacher"))
        .map((membership) => ({
          id: membership.id,
          label: membership.profile?.full_name ?? membership.profile?.email ?? "Teacher",
        }));
      setSections(nextSections);
      setSubjects(nextSubjects);
      setTeachers(nextTeachers);
      setAssignments(((assignmentsResult.data ?? []) as any[]).map((assignment) => {
        const submissions = assignment.submissions ?? [];
        const submitted = submissions.filter((item: any) => ["submitted", "late", "excused"].includes(item.status)).length;
        const total = submissions.length;
        return {
          id: assignment.id,
          title: assignment.title,
          instructions: assignment.instructions,
          assigned_date: assignment.assigned_date,
          due_date: assignment.due_date,
          status: assignment.status,
          class_section_id: assignment.class_section_id,
          subject_id: assignment.subject_id,
          teacher_membership_id: assignment.teacher_membership_id,
          className: assignment.class_section?.name ?? "Class",
          classCode: assignment.class_section?.code ?? "Class",
          subjectName: assignment.subject?.name ?? "General",
          teacherName: assignment.teacher?.profile?.full_name ?? assignment.teacher?.profile?.email ?? "Teacher",
          total,
          submitted,
          pending: Math.max(0, total - submitted),
        };
      }));
      setForm((current) => ({
        ...current,
        classSectionId: current.classSectionId || nextSections[0]?.id || "",
        subjectId: current.subjectId || nextSubjects[0]?.id || "",
        teacherMembershipId: isTeacherOnly ? selectedMembership.id : current.teacherMembershipId || nextTeachers[0]?.id || "",
      }));
    }

    setLoading(false);
  }, [isTeacherOnly, selectedMembership?.id, tenantScope]);

  React.useEffect(() => {
    loadHomework();
  }, [loadHomework]);

  React.useEffect(() => {
    if (!selectedMembership?.school_id) return;
    const channel = supabase
      .channel(`homework-${selectedMembership.school_id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "homework_assignments", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadHomework())
      .on("postgres_changes", { event: "*", schema: "public", table: "homework_submissions", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadHomework())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadHomework, selectedMembership?.school_id]);

  const createAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantScope || !selectedMembership?.id || !canManage) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const teacherMembershipId = isTeacherOnly ? selectedMembership.id : form.teacherMembershipId;
      if (!teacherMembershipId) throw new Error("Select a teacher for this homework assignment.");
      const { data: assignment, error: assignmentError } = await supabase
        .from("homework_assignments")
        .insert({
          organization_id: tenantScope.organization_id,
          school_id: tenantScope.school_id,
          class_section_id: form.classSectionId,
          subject_id: form.subjectId || null,
          teacher_membership_id: teacherMembershipId,
          title: form.title.trim(),
          instructions: form.instructions.trim() || null,
          assigned_date: new Date().toISOString().slice(0, 10),
          due_date: form.dueDate,
          status: "active",
        })
        .select("id")
        .single();
      if (assignmentError) throw assignmentError;

      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id")
        .eq("organization_id", tenantScope.organization_id)
        .eq("school_id", tenantScope.school_id)
        .eq("class_section_id", form.classSectionId)
        .eq("enrollment_status", "active");
      if (studentsError) throw studentsError;

      if ((students ?? []).length > 0) {
        const { error: submissionsError } = await supabase.from("homework_submissions").insert(
          (students ?? []).map((student) => ({
            organization_id: tenantScope.organization_id,
            school_id: tenantScope.school_id,
            assignment_id: assignment.id,
            student_id: student.id,
            status: "pending",
          })),
        );
        if (submissionsError) throw submissionsError;
      }

      setSuccess(`${form.title.trim()} created for ${students?.length ?? 0} students.`);
      setForm({ ...emptyForm, classSectionId: sections[0]?.id || "", subjectId: subjects[0]?.id || "", teacherMembershipId: isTeacherOnly ? selectedMembership.id : teachers[0]?.id || "" });
      await loadHomework();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create homework");
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async (assignment: AssignmentRow) => {
    const { error: updateError } = await supabase
      .from("homework_assignments")
      .update({ status: assignment.status === "completed" ? "active" : "completed" })
      .eq("id", assignment.id);
    if (updateError) setError(updateError.message);
    await loadHomework();
  };

  const filtered = assignments.filter((assignment) => {
    const text = `${assignment.title} ${assignment.className} ${assignment.subjectName} ${assignment.teacherName}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const submitted = assignments.reduce((sum, item) => sum + item.submitted, 0);
  const pending = assignments.reduce((sum, item) => sum + item.pending, 0);
  const overdue = assignments.filter((item) => item.status === "active" && item.pending > 0 && item.due_date < new Date().toISOString().slice(0, 10)).length;
  const pieData = [
    { name: "Submitted", value: submitted, fill: "hsl(168 65% 38%)" },
    { name: "Pending", value: pending, fill: "hsl(37 90% 55%)" },
  ];
  const chartData = assignments.map((assignment) => ({
    class: assignment.classCode,
    submitted: assignment.submitted,
    pending: assignment.pending,
  }));

  return (
    <div>
      <PageHeader
        title={isTeacherOnly ? "My Homework" : "Homework & Assignments"}
        description={isTeacherOnly ? "Create and track homework for your assigned classes." : "Track tenant homework across teachers and classes."}
      />

      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric title="Assignments" value={assignments.length} helper="active tenant records" />
        <Metric title="Pending Submissions" value={pending} helper="students still pending" />
        <Metric title="Overdue" value={overdue} helper="assignments past due" tone="danger" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {canManage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FilePlus2 className="h-5 w-5 text-primary" />Create Homework</CardTitle>
              <CardDescription>{isTeacherOnly ? "Only assigned classes are available." : "Create homework and generate student submission rows."}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createAssignment} className="space-y-4">
                <Field id="homework-title" label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Chapter 4 practice" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField id="homework-class" label="Class" value={form.classSectionId} onChange={(value) => setForm({ ...form, classSectionId: value })} options={sections.map((section) => [section.id, `${section.grade_level?.name ?? "Grade"} - ${section.name}`])} />
                  <SelectField id="homework-subject" label="Subject" value={form.subjectId} onChange={(value) => setForm({ ...form, subjectId: value })} options={subjects.map((subject) => [subject.id, subject.name])} />
                </div>
                {!isTeacherOnly && (
                  <SelectField id="homework-teacher" label="Teacher" value={form.teacherMembershipId} onChange={(value) => setForm({ ...form, teacherMembershipId: value })} options={teachers.map((teacher) => [teacher.id, teacher.label])} />
                )}
                <Field id="homework-due" label="Due date" type="date" value={form.dueDate} onChange={(value) => setForm({ ...form, dueDate: value })} />
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <textarea
                    id="instructions"
                    value={form.instructions}
                    onChange={(event) => setForm({ ...form, instructions: event.target.value })}
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="What should students complete?"
                  />
                </div>
                <Button type="submit" disabled={saving || sections.length === 0 || !form.title.trim()}>
                  <FilePlus2 className="mr-2 h-4 w-4" />
                  {saving ? "Creating..." : "Create assignment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className={!canManage ? "xl:col-span-2" : ""}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Assignment Board</CardTitle>
              <CardDescription>{filtered.length} of {assignments.length} assignments.</CardDescription>
            </div>
            <Button variant="outline" onClick={loadHomework} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid gap-3 border-y p-4 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm" placeholder="Search assignment, class, teacher..." />
              </div>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <button key={filter} onClick={() => setStatusFilter(filter)} className={`rounded-md px-3 py-2 text-xs font-medium capitalize ${statusFilter === filter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assignment</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Class</th>
                    {!isTeacherOnly && <th className="px-4 py-3 text-left font-medium text-muted-foreground">Teacher</th>}
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submissions</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    {canManage && <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={canManage ? 7 : 6} className="px-4 py-8 text-center text-muted-foreground">No homework found.</td></tr>
                  ) : filtered.map((assignment) => (
                    <tr key={assignment.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium">{assignment.title}</div>
                        <div className="text-xs text-muted-foreground">{assignment.subjectName}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{assignment.className}</td>
                      {!isTeacherOnly && <td className="px-4 py-3 text-muted-foreground">{assignment.teacherName}</td>}
                      <td className="px-4 py-3 text-muted-foreground"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />{assignment.due_date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 min-w-[80px] rounded-full bg-muted">
                            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${assignment.total ? Math.round((assignment.submitted / assignment.total) * 100) : 0}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{assignment.submitted}/{assignment.total}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={assignment.status} /></td>
                      {canManage && (
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => markCompleted(assignment)}>
                            {assignment.status === "completed" ? "Reopen" : "Complete"}
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.65fr]">
        <Card>
          <CardHeader><CardTitle className="text-base">Submission Load by Class</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="submitted" name="Submitted" stackId="a" fill="hsl(168 65% 38%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="hsl(37 90% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Submission Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={58} outerRadius={86} paddingAngle={3}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid gap-2">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.fill }} />{entry.name}</span>
                  <span className="font-semibold">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function Metric(props: { title: string; value: number; helper: string; tone?: "default" | "danger" }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground">{props.title}</div>
        <div className={`mt-2 text-3xl font-bold ${props.tone === "danger" ? "text-red-600" : ""}`}>{props.value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{props.helper}</div>
      </CardContent>
    </Card>
  );
}

function Field(props: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input id={props.id} type={props.type ?? "text"} value={props.value} onChange={(event) => props.onChange(event.target.value)} placeholder={props.placeholder} required />
    </div>
  );
}

function SelectField(props: { id: string; label: string; value: string; onChange: (value: string) => void; options: string[][] }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <select id={props.id} value={props.value} onChange={(event) => props.onChange(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
        <option value="">Select</option>
        {props.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
  );
}
