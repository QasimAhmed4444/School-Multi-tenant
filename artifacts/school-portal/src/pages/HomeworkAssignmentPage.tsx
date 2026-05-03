import React from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type SubmissionStatus = "pending" | "submitted" | "late" | "missing" | "excused";
type AssignmentDetail = {
  id: string;
  title: string;
  instructions: string | null;
  due_date: string;
  status: string;
  className: string;
  subjectName: string;
};
type SubmissionRow = {
  id: string;
  studentName: string;
  admissionNo: string;
  status: SubmissionStatus;
  notes: string | null;
  submitted_at: string | null;
};

const submissionStatuses: SubmissionStatus[] = ["pending", "submitted", "late", "missing", "excused"];
const label = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function HomeworkAssignmentPage() {
  const params = useParams<{ assignmentId: string }>();
  const [, navigate] = useLocation();
  const { selectedMembership } = useTenant();
  const [assignment, setAssignment] = React.useState<AssignmentDetail | null>(null);
  const [submissions, setSubmissions] = React.useState<SubmissionRow[]>([]);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadAssignment = React.useCallback(async () => {
    if (!params.assignmentId || !selectedMembership?.school_id) return;
    setLoading(true);
    setError(null);

    const { data, error: loadError } = await supabase
      .from("homework_assignments")
      .select("id,title,instructions,due_date,status,class_section:class_sections(name,code),subject:subjects(name),submissions:homework_submissions(id,status,notes,submitted_at,student:students(full_name,admission_no))")
      .eq("id", params.assignmentId)
      .eq("school_id", selectedMembership.school_id)
      .maybeSingle();

    if (loadError) {
      setError(loadError.message);
      setAssignment(null);
      setSubmissions([]);
    } else if (!data) {
      setError("Homework assignment was not found or you do not have access.");
      setAssignment(null);
      setSubmissions([]);
    } else {
      const row = data as any;
      setAssignment({
        id: row.id,
        title: row.title,
        instructions: row.instructions,
        due_date: row.due_date,
        status: row.status,
        className: `${row.class_section?.name ?? "Class"} (${row.class_section?.code ?? "-"})`,
        subjectName: row.subject?.name ?? "General",
      });
      setSubmissions((row.submissions ?? []).map((submission: any) => ({
        id: submission.id,
        studentName: submission.student?.full_name ?? "Student",
        admissionNo: submission.student?.admission_no ?? "-",
        status: submission.status,
        notes: submission.notes,
        submitted_at: submission.submitted_at,
      })));
    }

    setLoading(false);
  }, [params.assignmentId, selectedMembership?.school_id]);

  React.useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  React.useEffect(() => {
    if (!params.assignmentId || !selectedMembership?.school_id) return;
    const channel = supabase
      .channel(`homework-detail-${params.assignmentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "homework_submissions", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadAssignment())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAssignment, params.assignmentId, selectedMembership?.school_id]);

  const updateLocal = (id: string, patch: Partial<SubmissionRow>) => {
    setSubmissions((current) => current.map((submission) => (submission.id === id ? { ...submission, ...patch } : submission)));
  };

  const saveSubmission = async (submission: SubmissionRow) => {
    setSavingId(submission.id);
    const shouldStamp = ["submitted", "late", "excused"].includes(submission.status);
    const { error: updateError } = await supabase
      .from("homework_submissions")
      .update({
        status: submission.status,
        notes: submission.notes || null,
        submitted_at: shouldStamp ? submission.submitted_at ?? new Date().toISOString() : null,
      })
      .eq("id", submission.id);

    if (updateError) setError(updateError.message);
    setSavingId(null);
    await loadAssignment();
  };

  const submitted = submissions.filter((row) => ["submitted", "late", "excused"].includes(row.status)).length;
  const pending = submissions.length - submitted;

  return (
    <div>
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/homework")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to homework
        </Button>
      </div>

      <PageHeader
        title={assignment?.title ?? "Homework Assignment"}
        description={assignment ? `${assignment.className} / ${assignment.subjectName} / due ${assignment.due_date}` : "Loading assignment details."}
      />

      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric title="Students" value={submissions.length} />
        <Metric title="Submitted" value={submitted} />
        <Metric title="Pending" value={pending} danger={pending > 0} />
      </div>

      {assignment?.instructions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{assignment.instructions}</CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
          <CardDescription>{loading ? "Loading..." : "Update individual submission status and notes."}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notes</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submitted At</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No submission rows found.</td></tr>
                ) : submissions.map((submission) => (
                  <tr key={submission.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{submission.studentName}</div>
                      <div className="font-mono text-xs text-muted-foreground">{submission.admissionNo}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select value={submission.status} onChange={(event) => updateLocal(submission.id, { status: event.target.value as SubmissionStatus })} className="h-8 rounded-md border border-input bg-background px-2 text-sm">
                          {submissionStatuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
                        </select>
                        <StatusBadge status={submission.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input value={submission.notes ?? ""} onChange={(event) => updateLocal(submission.id, { notes: event.target.value })} placeholder="Optional note" className="h-8 min-w-[220px] rounded-md border border-input bg-background px-2 text-sm" />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => saveSubmission(submission)} disabled={savingId === submission.id}>
                        <Save className="mr-2 h-4 w-4" />
                        {savingId === submission.id ? "Saving" : "Save"}
                      </Button>
                    </td>
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

function Metric(props: { title: string; value: number; danger?: boolean }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground">{props.title}</div>
        <div className={`mt-2 text-3xl font-bold ${props.danger ? "text-amber-600" : ""}`}>{props.value}</div>
      </CardContent>
    </Card>
  );
}
