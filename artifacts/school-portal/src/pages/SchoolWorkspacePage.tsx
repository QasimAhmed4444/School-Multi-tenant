import React from "react";
import { Building2, Calendar, CheckCircle2, GraduationCap, Layers3, ShieldCheck, Users } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type Counts = {
  users: number;
  academicYears: number;
  grades: number;
  sections: number;
};

const emptyCounts: Counts = { users: 0, academicYears: 0, grades: 0, sections: 0 };

async function countRows(table: "memberships" | "academic_years" | "grade_levels" | "class_sections", organizationId: string, schoolId: string) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("school_id", schoolId);

  if (error) throw error;
  return count ?? 0;
}

export function SchoolWorkspacePage() {
  const { selectedMembership } = useTenant();
  const [counts, setCounts] = React.useState<Counts>(emptyCounts);
  const [error, setError] = React.useState<string | null>(null);
  const school = selectedMembership?.school;
  const organization = selectedMembership?.organization;
  const roles = selectedMembership?.membership_roles?.map((item) => item.role?.name).filter(Boolean).join(", ") || "Member";

  React.useEffect(() => {
    if (!selectedMembership?.organization_id || !selectedMembership.school_id) return;

    Promise.all([
      countRows("memberships", selectedMembership.organization_id, selectedMembership.school_id),
      countRows("academic_years", selectedMembership.organization_id, selectedMembership.school_id),
      countRows("grade_levels", selectedMembership.organization_id, selectedMembership.school_id),
      countRows("class_sections", selectedMembership.organization_id, selectedMembership.school_id),
    ])
      .then(([users, academicYears, grades, sections]) => {
        setCounts({ users, academicYears, grades, sections });
        setError(null);
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Unable to load workspace"));
  }, [selectedMembership]);

  const setupItems = [
    { label: "School tenant selected", done: Boolean(selectedMembership?.school_id) },
    { label: "Academic year created", done: counts.academicYears > 0 },
    { label: "Grades/classes created", done: counts.grades > 0 },
    { label: "Sections created", done: counts.sections > 0 },
    { label: "Users assigned", done: counts.users > 1 },
  ];

  return (
    <div>
      <PageHeader
        title={school?.name ?? "School Workspace"}
        description={`${organization?.name ?? "Organization"} / ${roles}`}
      />

      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Assigned Users" value={String(counts.users)} icon={Users} description="active school memberships" colorClass="text-blue-600" />
        <KPICard title="Academic Years" value={String(counts.academicYears)} icon={Calendar} description="school calendar setup" colorClass="text-emerald-600" />
        <KPICard title="Grades" value={String(counts.grades)} icon={GraduationCap} description="grade levels configured" colorClass="text-violet-600" />
        <KPICard title="Sections" value={String(counts.sections)} icon={Layers3} description="class sections configured" colorClass="text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Status</CardTitle>
            <CardDescription>This is the real tenant landing page. It reads school-scoped Supabase data through RLS.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Organization
              </div>
              <div className="text-xl font-semibold">{organization?.name ?? "Not selected"}</div>
              <div className="text-xs text-muted-foreground">{organization?.org_code}</div>
            </div>
            <div className="rounded-md border bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                Access
              </div>
              <div className="text-xl font-semibold">{roles}</div>
              <div className="text-xs text-muted-foreground">from membership roles</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Checklist</CardTitle>
            <CardDescription>Finish this before students, attendance, and fees.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {setupItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">{item.label}</span>
                <CheckCircle2 className={`h-4 w-4 ${item.done ? "text-emerald-600" : "text-muted-foreground/40"}`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
