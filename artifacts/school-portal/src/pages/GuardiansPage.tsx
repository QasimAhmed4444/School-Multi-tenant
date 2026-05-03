import React from "react";
import { Mail, Phone, RefreshCw, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/domains/authz/usePermissions";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type GuardianRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  relationship_label: string | null;
  status: string;
  student_guardians?: Array<{ student?: { full_name: string; admission_no: string } | null }>;
};

export function GuardiansPage() {
  const { selectedMembership } = useTenant();
  const { roleKeys } = usePermissions();
  const [guardians, setGuardians] = React.useState<GuardianRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isTeacherOnly = roleKeys.includes("teacher") && !roleKeys.some((role) => ["school_admin", "principal", "school_owner", "organization_owner"].includes(role));

  const loadGuardians = React.useCallback(async () => {
    if (!selectedMembership?.organization_id || !selectedMembership.school_id) return;

    setLoading(true);
    setError(null);

    const assignedSectionIds = isTeacherOnly
      ? ((await supabase
          .from("teacher_assignments")
          .select("class_section_id")
          .eq("organization_id", selectedMembership.organization_id)
          .eq("school_id", selectedMembership.school_id)
          .eq("teacher_membership_id", selectedMembership.id)
          .eq("status", "active")).data ?? [])
          .map((assignment) => assignment.class_section_id)
          .filter(Boolean)
      : [];

    if (isTeacherOnly && assignedSectionIds.length === 0) {
      setGuardians([]);
      setLoading(false);
      return;
    }

    const linkedGuardianIds = isTeacherOnly
      ? ((await supabase
          .from("student_guardians")
          .select("guardian_id,student:students!inner(class_section_id)")
          .eq("organization_id", selectedMembership.organization_id)
          .eq("school_id", selectedMembership.school_id)
          .in("student.class_section_id", assignedSectionIds)).data ?? [])
          .map((link) => link.guardian_id)
          .filter(Boolean)
      : [];

    if (isTeacherOnly && linkedGuardianIds.length === 0) {
      setGuardians([]);
      setLoading(false);
      return;
    }

    let guardiansQuery = supabase
      .from("guardians")
      .select("id,full_name,email,phone,relationship_label,status,student_guardians(student:students(full_name,admission_no))")
      .eq("organization_id", selectedMembership.organization_id)
      .eq("school_id", selectedMembership.school_id)
      .order("created_at", { ascending: false });

    if (isTeacherOnly) {
      guardiansQuery = guardiansQuery.in("id", linkedGuardianIds);
    }

    const { data, error: loadError } = await guardiansQuery;

    if (loadError) {
      setError(loadError.message);
      setGuardians([]);
    } else {
      setGuardians((data ?? []) as unknown as GuardianRow[]);
    }
    setLoading(false);
  }, [isTeacherOnly, selectedMembership]);

  React.useEffect(() => {
    loadGuardians();
  }, [loadGuardians]);

  const filtered = guardians.filter((guardian) => {
    const linkedStudents = guardian.student_guardians?.map((item) => item.student?.full_name).join(" ") ?? "";
    return `${guardian.full_name} ${guardian.email ?? ""} ${guardian.phone ?? ""} ${linkedStudents}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader title="Guardians" description="Real guardian directory linked to student records." />
      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Guardian Directory</CardTitle>
            <CardDescription>{filtered.length} of {guardians.length} guardians in this school.</CardDescription>
          </div>
          <Button variant="outline" onClick={loadGuardians} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-y p-4">
            <div className="relative max-w-lg">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm" placeholder="Search guardian or linked student..." />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30"><th className="px-4 py-3 text-left font-medium text-muted-foreground">Guardian</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Linked Students</th><th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No guardians found.</td></tr>
                ) : filtered.map((guardian) => (
                  <tr key={guardian.id} className="border-b last:border-0">
                    <td className="px-4 py-3"><div className="font-medium">{guardian.full_name}</div><div className="text-xs text-muted-foreground">{guardian.relationship_label ?? "guardian"}</div></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{guardian.email ?? "No email"}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{guardian.phone ?? "No phone"}</div>
                    </td>
                    <td className="px-4 py-3">
                      {(guardian.student_guardians ?? []).length === 0 ? "No students" : guardian.student_guardians?.map((item) => (
                        <div key={item.student?.admission_no} className="text-sm">{item.student?.full_name} <span className="font-mono text-xs text-muted-foreground">{item.student?.admission_no}</span></div>
                      ))}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={guardian.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
