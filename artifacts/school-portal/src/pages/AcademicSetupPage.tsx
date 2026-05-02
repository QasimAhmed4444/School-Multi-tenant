import React from "react";
import { BookOpen, CalendarDays, Layers3, Plus, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type AcademicYear = {
  id: string;
  name: string;
  starts_on: string;
  ends_on: string;
  status: string;
};

type GradeLevel = {
  id: string;
  name: string;
  code: string;
  sort_order: number;
  status: string;
};

type ClassSection = {
  id: string;
  grade_level_id: string;
  name: string;
  code: string;
  capacity: number | null;
  status: string;
  grade_level?: {
    name: string;
    code: string;
  } | null;
};

export function AcademicSetupPage() {
  const { selectedMembership } = useTenant();
  const [years, setYears] = React.useState<AcademicYear[]>([]);
  const [grades, setGrades] = React.useState<GradeLevel[]>([]);
  const [sections, setSections] = React.useState<ClassSection[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [yearForm, setYearForm] = React.useState({
    name: "2026-2027",
    starts_on: "2026-08-01",
    ends_on: "2027-06-30",
    status: "planned",
  });
  const [gradeForm, setGradeForm] = React.useState({
    name: "Grade 1",
    code: "G1",
    sort_order: "1",
  });
  const [sectionForm, setSectionForm] = React.useState({
    grade_level_id: "",
    name: "A",
    code: "G1-A",
    capacity: "30",
  });

  const tenantScope = React.useMemo(() => {
    if (!selectedMembership?.organization_id || !selectedMembership.school_id) return null;
    return {
      organization_id: selectedMembership.organization_id,
      school_id: selectedMembership.school_id,
    };
  }, [selectedMembership]);

  const loadSetup = React.useCallback(async () => {
    if (!tenantScope) return;

    setLoading(true);
    setError(null);

    const [yearResult, gradeResult, sectionResult] = await Promise.all([
      supabase
        .from("academic_years")
        .select("id,name,starts_on,ends_on,status")
        .eq("organization_id", tenantScope.organization_id)
        .eq("school_id", tenantScope.school_id)
        .order("starts_on", { ascending: false }),
      supabase
        .from("grade_levels")
        .select("id,name,code,sort_order,status")
        .eq("organization_id", tenantScope.organization_id)
        .eq("school_id", tenantScope.school_id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("class_sections")
        .select("id,grade_level_id,name,code,capacity,status,grade_level:grade_levels!class_sections_grade_level_id_fkey(name,code)")
        .eq("organization_id", tenantScope.organization_id)
        .eq("school_id", tenantScope.school_id)
        .order("name", { ascending: true }),
    ]);

    const firstError = yearResult.error ?? gradeResult.error ?? sectionResult.error;
    if (firstError) {
      setError(firstError.message);
      setYears([]);
      setGrades([]);
      setSections([]);
    } else {
      const loadedGrades = (gradeResult.data ?? []) as GradeLevel[];
      setYears((yearResult.data ?? []) as AcademicYear[]);
      setGrades(loadedGrades);
      setSections((sectionResult.data ?? []) as unknown as ClassSection[]);
      setSectionForm((current) => ({
        ...current,
        grade_level_id: current.grade_level_id || loadedGrades[0]?.id || "",
      }));
    }

    setLoading(false);
  }, [tenantScope]);

  React.useEffect(() => {
    loadSetup();
  }, [loadSetup]);

  const createAcademicYear = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantScope) return;

    setSaving("year");
    setError(null);
    setSuccess(null);

    const { error: insertError } = await supabase.from("academic_years").insert({
      organization_id: tenantScope.organization_id,
      school_id: tenantScope.school_id,
      name: yearForm.name.trim(),
      starts_on: yearForm.starts_on,
      ends_on: yearForm.ends_on,
      status: yearForm.status,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Academic year created.");
      await loadSetup();
    }

    setSaving(null);
  };

  const createGrade = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantScope) return;

    setSaving("grade");
    setError(null);
    setSuccess(null);

    const { error: insertError } = await supabase.from("grade_levels").insert({
      organization_id: tenantScope.organization_id,
      school_id: tenantScope.school_id,
      name: gradeForm.name.trim(),
      code: gradeForm.code.trim().toUpperCase(),
      sort_order: Number(gradeForm.sort_order),
      status: "active",
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Grade created.");
      await loadSetup();
    }

    setSaving(null);
  };

  const createSection = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tenantScope || !sectionForm.grade_level_id) return;

    setSaving("section");
    setError(null);
    setSuccess(null);

    const { error: insertError } = await supabase.from("class_sections").insert({
      organization_id: tenantScope.organization_id,
      school_id: tenantScope.school_id,
      grade_level_id: sectionForm.grade_level_id,
      name: sectionForm.name.trim(),
      code: sectionForm.code.trim().toUpperCase(),
      capacity: sectionForm.capacity ? Number(sectionForm.capacity) : null,
      status: "active",
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Section created.");
      await loadSetup();
    }

    setSaving(null);
  };

  return (
    <div>
      <PageHeader title="Academic Setup" description="Create the real academic structure for the selected school before adding students." />

      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="mb-6 flex justify-end">
        <Button variant="outline" onClick={loadSetup} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Academic Year
            </CardTitle>
            <CardDescription>One school can run different calendars without hardcoded country logic.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createAcademicYear} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="year-name">Name</Label>
                <Input id="year-name" value={yearForm.name} onChange={(event) => setYearForm({ ...yearForm, name: event.target.value })} required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="starts-on">Starts</Label>
                  <Input id="starts-on" type="date" value={yearForm.starts_on} onChange={(event) => setYearForm({ ...yearForm, starts_on: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ends-on">Ends</Label>
                  <Input id="ends-on" type="date" value={yearForm.ends_on} onChange={(event) => setYearForm({ ...yearForm, ends_on: event.target.value })} required />
                </div>
              </div>
              <Button type="submit" disabled={saving === "year"}>
                <Plus className="mr-2 h-4 w-4" />
                {saving === "year" ? "Creating..." : "Create year"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Grades / Classes
            </CardTitle>
            <CardDescription>Use neutral grade levels so the system can adapt to Montessori, K-12, or local programs.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createGrade} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="grade-name">Name</Label>
                <Input id="grade-name" value={gradeForm.name} onChange={(event) => setGradeForm({ ...gradeForm, name: event.target.value })} required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="grade-code">Code</Label>
                  <Input id="grade-code" value={gradeForm.code} onChange={(event) => setGradeForm({ ...gradeForm, code: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort-order">Sort</Label>
                  <Input id="sort-order" type="number" value={gradeForm.sort_order} onChange={(event) => setGradeForm({ ...gradeForm, sort_order: event.target.value })} required />
                </div>
              </div>
              <Button type="submit" disabled={saving === "grade"}>
                <Plus className="mr-2 h-4 w-4" />
                {saving === "grade" ? "Creating..." : "Create grade"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers3 className="h-5 w-5 text-primary" />
              Sections
            </CardTitle>
            <CardDescription>Sections belong to one grade and one school, always under tenant isolation.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createSection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="grade-level">Grade</Label>
                <select
                  id="grade-level"
                  value={sectionForm.grade_level_id}
                  onChange={(event) => setSectionForm({ ...sectionForm, grade_level_id: event.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select grade</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="section-name">Name</Label>
                  <Input id="section-name" value={sectionForm.name} onChange={(event) => setSectionForm({ ...sectionForm, name: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section-code">Code</Label>
                  <Input id="section-code" value={sectionForm.code} onChange={(event) => setSectionForm({ ...sectionForm, code: event.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Seats</Label>
                  <Input id="capacity" type="number" value={sectionForm.capacity} onChange={(event) => setSectionForm({ ...sectionForm, capacity: event.target.value })} />
                </div>
              </div>
              <Button type="submit" disabled={saving === "section" || grades.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                {saving === "section" ? "Creating..." : "Create section"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ListCard title="Academic Years" empty="No academic years yet.">
          {years.map((year) => (
            <div key={year.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{year.name}</div>
                <div className="text-xs text-muted-foreground">{year.starts_on} to {year.ends_on}</div>
              </div>
              <StatusBadge status={year.status} />
            </div>
          ))}
        </ListCard>

        <ListCard title="Grades / Classes" empty="No grades yet.">
          {grades.map((grade) => (
            <div key={grade.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{grade.name}</div>
                <div className="text-xs text-muted-foreground">{grade.code} - sort {grade.sort_order}</div>
              </div>
              <StatusBadge status={grade.status} />
            </div>
          ))}
        </ListCard>

        <ListCard title="Sections" empty="No sections yet.">
          {sections.map((section) => (
            <div key={section.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="font-medium">{section.grade_level?.name ?? "Grade"} - {section.name}</div>
                <div className="text-xs text-muted-foreground">{section.code}{section.capacity ? ` - ${section.capacity} seats` : ""}</div>
              </div>
              <StatusBadge status={section.status} />
            </div>
          ))}
        </ListCard>
      </div>
    </div>
  );
}

function ListCard({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children.length > 0 ? children : <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</div>}
      </CardContent>
    </Card>
  );
}
