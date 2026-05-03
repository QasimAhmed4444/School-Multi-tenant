import React from "react";
import { BookOpen, CalendarCheck2, Clock, FileText } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type AttendanceStatus = "pending" | "present" | "absent" | "late" | "excused";
type StudentSummary = {
  id: string;
  fullName: string;
  admissionNo: string;
  className: string;
  gradeName: string;
};
type AttendanceRow = {
  id: string;
  attendance_date: string;
  status: AttendanceStatus;
  time_in: string | null;
  notes: string | null;
};
type HomeworkRow = {
  id: string;
  status: string;
  submitted_at: string | null;
  notes: string | null;
  assignmentTitle: string;
  dueDate: string;
  assignmentStatus: string;
  subjectName: string;
};

const today = () => new Date().toISOString().slice(0, 10);

export const StudentDashboard: React.FC = () => {
  const { selectedMembership } = useTenant();
  const studentId = selectedMembership?.metadata?.student_id as string | undefined;
  const [student, setStudent] = React.useState<StudentSummary | null>(null);
  const [attendance, setAttendance] = React.useState<AttendanceRow[]>([]);
  const [homework, setHomework] = React.useState<HomeworkRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const loadStudentPortal = React.useCallback(async () => {
    if (!studentId || !selectedMembership?.school_id) return;
    setError(null);

    const [studentResult, attendanceResult, homeworkResult] = await Promise.all([
      supabase
        .from("students")
        .select("id,full_name,admission_no,class_section:class_sections(name,code),grade_level:grade_levels(name)")
        .eq("id", studentId)
        .eq("school_id", selectedMembership.school_id)
        .maybeSingle(),
      supabase
        .from("attendance_records")
        .select("id,attendance_date,status,time_in,notes")
        .eq("student_id", studentId)
        .eq("school_id", selectedMembership.school_id)
        .order("attendance_date", { ascending: false })
        .limit(30),
      supabase
        .from("homework_submissions")
        .select("id,status,submitted_at,notes,assignment:homework_assignments(title,due_date,status,subject:subjects(name))")
        .eq("student_id", studentId)
        .eq("school_id", selectedMembership.school_id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const firstError = studentResult.error ?? attendanceResult.error ?? homeworkResult.error;
    if (firstError) {
      setError(firstError.message);
      setStudent(null);
      setAttendance([]);
      setHomework([]);
      return;
    }

    const studentRow = studentResult.data as any;
    if (!studentRow) {
      setError("Your login is active, but no student record is linked yet.");
      return;
    }

    setStudent({
      id: studentRow.id,
      fullName: studentRow.full_name,
      admissionNo: studentRow.admission_no,
      className: studentRow.class_section?.name ?? "Class not assigned",
      gradeName: studentRow.grade_level?.name ?? "Grade not assigned",
    });
    setAttendance(((attendanceResult.data ?? []) as any[]).map((row) => ({
      id: row.id,
      attendance_date: row.attendance_date,
      status: row.status,
      time_in: row.time_in,
      notes: row.notes,
    })));
    setHomework(((homeworkResult.data ?? []) as any[]).map((row) => ({
      id: row.id,
      status: row.status,
      submitted_at: row.submitted_at,
      notes: row.notes,
      assignmentTitle: row.assignment?.title ?? "Homework",
      dueDate: row.assignment?.due_date ?? "-",
      assignmentStatus: row.assignment?.status ?? "active",
      subjectName: row.assignment?.subject?.name ?? "General",
    })));
  }, [selectedMembership?.school_id, studentId]);

  React.useEffect(() => {
    loadStudentPortal();
  }, [loadStudentPortal]);

  React.useEffect(() => {
    if (!studentId || !selectedMembership?.school_id) return;
    const channel = supabase
      .channel(`student-portal-${studentId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadStudentPortal())
      .on("postgres_changes", { event: "*", schema: "public", table: "homework_submissions", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadStudentPortal())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadStudentPortal, selectedMembership?.school_id, studentId]);

  const presentCount = attendance.filter((row) => ["present", "late", "excused"].includes(row.status)).length;
  const markedCount = attendance.filter((row) => row.status !== "pending").length;
  const attendanceRate = markedCount ? Math.round((presentCount / markedCount) * 100) : 0;
  const todayAttendance = attendance.find((row) => row.attendance_date === today());
  const pendingHomework = homework.filter((row) => ["pending", "missing"].includes(row.status)).length;
  const submittedHomework = homework.filter((row) => ["submitted", "late", "excused"].includes(row.status)).length;

  return (
    <div>
      <PageHeader
        title="Student Dashboard"
        description={student ? `${student.fullName} / ${student.gradeName} / ${student.className}` : "Read-only student workspace."}
      />

      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KPICard title="Today" value={todayAttendance?.status ?? "pending"} icon={CalendarCheck2} description={todayAttendance?.time_in ? `time in ${todayAttendance.time_in.slice(0, 5)}` : "attendance status"} colorClass="text-emerald-600" />
        <KPICard title="Attendance Rate" value={`${attendanceRate}%`} icon={Clock} description={`${markedCount} marked records`} colorClass="text-blue-600" />
        <KPICard title="Homework Pending" value={pendingHomework} icon={BookOpen} description="requires attention" colorClass="text-amber-600" />
        <KPICard title="Homework Submitted" value={submittedHomework} icon={FileText} description="submitted/late/excused" colorClass="text-violet-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Homework</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assignment</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Subject</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {homework.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No homework assigned yet.</td></tr>
                  ) : homework.map((row) => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{row.assignmentTitle}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.subjectName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.dueDate}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{row.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attendance.length === 0 ? (
              <div className="rounded-md border p-4 text-sm text-muted-foreground">No attendance records yet.</div>
            ) : attendance.slice(0, 10).map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">{row.attendance_date}</div>
                  <div className="text-xs text-muted-foreground">{row.notes || row.time_in?.slice(0, 5) || "No note"}</div>
                </div>
                <StatusBadge status={row.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
