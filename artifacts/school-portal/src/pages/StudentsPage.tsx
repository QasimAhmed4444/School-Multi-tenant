import React from "react";
import { Filter, Plus, RefreshCw, Search, UserRoundPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePermissions } from "@/domains/authz/usePermissions";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type GradeLevel = { id: string; name: string; code: string };
type Section = { id: string; name: string; code: string; grade_level_id: string; grade_level?: GradeLevel | null };
type StudentRow = {
  id: string;
  admission_no: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  enrollment_status: string;
  grade_level?: GradeLevel | null;
  class_section?: { id: string; name: string; code: string } | null;
  student_guardians?: Array<{ guardian?: { full_name: string; email: string | null; phone: string | null } | null }>;
};

const initialForm = {
  admissionNo: "",
  fullName: "",
  dateOfBirth: "",
  gender: "unspecified",
  gradeLevelId: "",
  sectionId: "",
  guardianName: "",
  guardianEmail: "",
  guardianPhone: "",
  relationship: "guardian",
};

export const StudentsPage: React.FC = () => {
  const { selectedMembership } = useTenant();
  const { hasPermission, roleKeys } = usePermissions();
  const [students, setStudents] = React.useState<StudentRow[]>([]);
  const [grades, setGrades] = React.useState<GradeLevel[]>([]);
  const [sections, setSections] = React.useState<Section[]>([]);
  const [form, setForm] = React.useState(initialForm);
  const [search, setSearch] = React.useState("");
  const [sectionFilter, setSectionFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const canManage = hasPermission("students.manage") && hasPermission("guardians.manage");
  const isTeacherOnly = roleKeys.includes("teacher") && !roleKeys.some((role) => ["school_admin", "principal", "school_owner", "organization_owner"].includes(role));

  const tenantScope = React.useMemo(() => {
    if (!selectedMembership?.organization_id || !selectedMembership.school_id) return null;
    return { organization_id: selectedMembership.organization_id, school_id: selectedMembership.school_id };
  }, [selectedMembership]);

  const loadStudents = React.useCallback(async () => {
    if (!tenantScope) return;
    setLoading(true);
    setError(null);

    const assignedSectionIds = isTeacherOnly && selectedMembership?.id
      ? ((await supabase
          .from("teacher_assignments")
          .select("class_section_id")
          .eq("organization_id", tenantScope.organization_id)
          .eq("school_id", tenantScope.school_id)
          .eq("teacher_membership_id", selectedMembership.id)
          .eq("status", "active")).data ?? [])
          .map((assignment) => assignment.class_section_id)
          .filter(Boolean)
      : [];

    let studentsQuery = supabase
      .from("students")
      .select("id,admission_no,full_name,date_of_birth,gender,enrollment_status,grade_level:grade_levels(id,name,code),class_section:class_sections(id,name,code),student_guardians(guardian:guardians(full_name,email,phone))")
      .eq("organization_id", tenantScope.organization_id)
      .eq("school_id", tenantScope.school_id)
      .order("created_at", { ascending: false });

    let sectionsQuery = supabase
      .from("class_sections")
      .select("id,name,code,grade_level_id,grade_level:grade_levels(id,name,code)")
      .eq("organization_id", tenantScope.organization_id)
      .eq("school_id", tenantScope.school_id)
      .eq("status", "active")
      .order("name", { ascending: true });

    if (isTeacherOnly) {
      if (assignedSectionIds.length === 0) {
        setStudents([]);
        setSections([]);
        setLoading(false);
        return;
      }
      studentsQuery = studentsQuery.in("class_section_id", assignedSectionIds);
      sectionsQuery = sectionsQuery.in("id", assignedSectionIds);
    }

    const [studentsResult, gradesResult, sectionsResult] = await Promise.all([
      studentsQuery,
      supabase
        .from("grade_levels")
        .select("id,name,code")
        .eq("organization_id", tenantScope.organization_id)
        .eq("school_id", tenantScope.school_id)
        .eq("status", "active")
        .order("sort_order", { ascending: true }),
      sectionsQuery,
    ]);

    const firstError = studentsResult.error ?? gradesResult.error ?? sectionsResult.error;
    if (firstError) {
      setError(firstError.message);
      setStudents([]);
    } else {
      const nextGrades = (gradesResult.data ?? []) as GradeLevel[];
      const nextSections = (sectionsResult.data ?? []) as unknown as Section[];
      setStudents((studentsResult.data ?? []) as unknown as StudentRow[]);
      setGrades(nextGrades);
      setSections(nextSections);
      setForm((current) => ({
        ...current,
        gradeLevelId: current.gradeLevelId || nextGrades[0]?.id || "",
        sectionId: current.sectionId || nextSections[0]?.id || "",
      }));
    }
    setLoading(false);
  }, [isTeacherOnly, selectedMembership?.id, tenantScope]);

  React.useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const createStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantScope || !canManage) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { data: guardian, error: guardianError } = await supabase
        .from("guardians")
        .upsert(
          {
            organization_id: tenantScope.organization_id,
            school_id: tenantScope.school_id,
            full_name: form.guardianName.trim(),
            email: form.guardianEmail.trim().toLowerCase() || null,
            phone: form.guardianPhone.trim() || null,
            relationship_label: form.relationship,
            status: "active",
          },
          { onConflict: "school_id,email" },
        )
        .select("id")
        .single();
      if (guardianError) throw guardianError;

      const section = sections.find((item) => item.id === form.sectionId);
      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert({
          organization_id: tenantScope.organization_id,
          school_id: tenantScope.school_id,
          admission_no: form.admissionNo.trim().toUpperCase(),
          full_name: form.fullName.trim(),
          date_of_birth: form.dateOfBirth || null,
          gender: form.gender,
          grade_level_id: form.gradeLevelId || section?.grade_level_id || null,
          class_section_id: form.sectionId || null,
          enrollment_status: "active",
        })
        .select("id")
        .single();
      if (studentError) throw studentError;

      const { error: linkError } = await supabase.from("student_guardians").insert({
        organization_id: tenantScope.organization_id,
        school_id: tenantScope.school_id,
        student_id: student.id,
        guardian_id: guardian.id,
        relationship: form.relationship,
        is_primary: true,
        can_pickup: true,
        receives_communications: true,
      });
      if (linkError) throw linkError;

      setSuccess(`${form.fullName.trim()} created and linked to guardian.`);
      setForm({ ...initialForm, gradeLevelId: grades[0]?.id || "", sectionId: sections[0]?.id || "" });
      await loadStudents();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create student");
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter((student) => {
    const guardian = student.student_guardians?.[0]?.guardian;
    const text = `${student.admission_no} ${student.full_name} ${guardian?.full_name ?? ""} ${guardian?.email ?? ""}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesSection = sectionFilter === "all" || student.class_section?.id === sectionFilter;
    return matchesSearch && matchesSection;
  });

  return (
    <div>
      <PageHeader title="Students" description="Real tenant-scoped student records with guardian links." />

      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        {canManage && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRoundPlus className="h-5 w-5 text-primary" />Add Student</CardTitle>
              <CardDescription>Create the student and first guardian in one clean flow.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createStudent} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="admission" label="Admission no." value={form.admissionNo} onChange={(value) => setForm({ ...form, admissionNo: value })} placeholder="STU-001" />
                  <Field id="student-name" label="Student name" value={form.fullName} onChange={(value) => setForm({ ...form, fullName: value })} placeholder="Student full name" />
                  <Field id="dob" label="Date of birth" type="date" value={form.dateOfBirth} onChange={(value) => setForm({ ...form, dateOfBirth: value })} />
                  <SelectField id="gender" label="Gender" value={form.gender} onChange={(value) => setForm({ ...form, gender: value })} options={[["unspecified", "Unspecified"], ["female", "Female"], ["male", "Male"], ["other", "Other"]]} />
                  <SelectField id="grade" label="Grade" value={form.gradeLevelId} onChange={(value) => setForm({ ...form, gradeLevelId: value })} options={grades.map((grade) => [grade.id, grade.name])} />
                  <SelectField id="section" label="Section" value={form.sectionId} onChange={(value) => setForm({ ...form, sectionId: value })} options={sections.filter((section) => !form.gradeLevelId || section.grade_level_id === form.gradeLevelId).map((section) => [section.id, `${section.grade_level?.name ?? "Grade"} - ${section.name}`])} />
                </div>
                <div className="border-t pt-4">
                  <div className="mb-3 text-sm font-semibold">Primary guardian</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="guardian-name" label="Guardian name" value={form.guardianName} onChange={(value) => setForm({ ...form, guardianName: value })} placeholder="Parent or guardian" />
                    <Field id="relationship" label="Relationship" value={form.relationship} onChange={(value) => setForm({ ...form, relationship: value })} placeholder="father, mother, guardian" />
                    <Field id="guardian-email" label="Guardian email" type="email" value={form.guardianEmail} onChange={(value) => setForm({ ...form, guardianEmail: value })} placeholder="parent@email.com" />
                    <Field id="guardian-phone" label="Guardian phone" value={form.guardianPhone} onChange={(value) => setForm({ ...form, guardianPhone: value })} placeholder="+966..." />
                  </div>
                </div>
                <Button type="submit" disabled={saving || grades.length === 0 || sections.length === 0}>
                  <Plus className="mr-2 h-4 w-4" />
                  {saving ? "Creating..." : "Create student"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className={!canManage ? "xl:col-span-2" : ""}>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>{filtered.length} of {students.length} students in this school.</CardDescription>
            </div>
            <Button variant="outline" onClick={loadStudents} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-y p-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm" placeholder="Search student or guardian..." />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="all">All sections</option>
                  {sections.map((section) => <option key={section.id} value={section.id}>{section.grade_level?.name ?? "Grade"} - {section.name}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30"><th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Class</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Guardian</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th></tr></thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No students found.</td></tr>
                  ) : filtered.map((student) => {
                    const guardian = student.student_guardians?.[0]?.guardian;
                    return (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="px-4 py-3"><div className="font-medium">{student.full_name}</div><div className="font-mono text-xs text-muted-foreground">{student.admission_no}</div></td>
                        <td className="px-4 py-3 text-muted-foreground">{student.grade_level?.name ?? "-"} / {student.class_section?.name ?? "-"}</td>
                        <td className="px-4 py-3"><div>{guardian?.full_name ?? "No guardian"}</div><div className="text-xs text-muted-foreground">{guardian?.email ?? guardian?.phone ?? ""}</div></td>
                        <td className="px-4 py-3"><StatusBadge status={student.enrollment_status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function Field(props: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input id={props.id} type={props.type ?? "text"} value={props.value} onChange={(event) => props.onChange(event.target.value)} placeholder={props.placeholder} required={props.type !== "date"} />
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
