import React from "react";
import { BookOpen, CalendarCheck2, Clock, Users } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/domains/auth/AuthProvider";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type ChildRow = {
  id: string;
  fullName: string;
  admissionNo: string;
  className: string;
  gradeName: string;
};
type AttendanceRow = {
  id: string;
  attendance_date: string;
  status: string;
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
  subjectName: string;
};

const today = () => new Date().toISOString().slice(0, 10);

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { selectedMembership } = useTenant();
  const [children, setChildren] = React.useState<ChildRow[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>("");
  const [attendance, setAttendance] = React.useState<AttendanceRow[]>([]);
  const [homework, setHomework] = React.useState<HomeworkRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const loadChildren = React.useCallback(async () => {
    if (!user?.id || !selectedMembership?.school_id) return;
    setError(null);

    const { data, error: childrenError } = await supabase
      .from("guardians")
      .select("id,student_guardians(student:students(id,full_name,admission_no,class_section:class_sections(name,code),grade_level:grade_levels(name)))")
      .eq("profile_id", user.id)
      .eq("school_id", selectedMembership.school_id)
      .eq("status", "active");

    if (childrenError) {
      setError(childrenError.message);
      setChildren([]);
      return;
    }

    const nextChildren = ((data ?? []) as any[]).flatMap((guardian) =>
      (guardian.student_guardians ?? []).map((link: any) => ({
        id: link.student?.id,
        fullName: link.student?.full_name ?? "Student",
        admissionNo: link.student?.admission_no ?? "-",
        className: link.student?.class_section?.name ?? "Class not assigned",
        gradeName: link.student?.grade_level?.name ?? "Grade not assigned",
      })).filter((child: ChildRow) => Boolean(child.id)),
    );

    setChildren(nextChildren);
    setSelectedStudentId((current) => current && nextChildren.some((child) => child.id === current) ? current : nextChildren[0]?.id ?? "");
  }, [selectedMembership?.school_id, user?.id]);

  const loadChildActivity = React.useCallback(async () => {
    if (!selectedStudentId || !selectedMembership?.school_id) return;

    const [attendanceResult, homeworkResult] = await Promise.all([
      supabase
        .from("attendance_records")
        .select("id,attendance_date,status,time_in,notes")
        .eq("student_id", selectedStudentId)
        .eq("school_id", selectedMembership.school_id)
        .order("attendance_date", { ascending: false })
        .limit(30),
      supabase
        .from("homework_submissions")
        .select("id,status,submitted_at,notes,assignment:homework_assignments(title,due_date,subject:subjects(name))")
        .eq("student_id", selectedStudentId)
        .eq("school_id", selectedMembership.school_id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const firstError = attendanceResult.error ?? homeworkResult.error;
    if (firstError) {
      setError(firstError.message);
      setAttendance([]);
      setHomework([]);
      return;
    }

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
      subjectName: row.assignment?.subject?.name ?? "General",
    })));
  }, [selectedMembership?.school_id, selectedStudentId]);

  React.useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  React.useEffect(() => {
    loadChildActivity();
  }, [loadChildActivity]);

  React.useEffect(() => {
    if (!selectedMembership?.school_id) return;
    const channel = supabase
      .channel(`parent-portal-${selectedMembership.school_id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadChildActivity())
      .on("postgres_changes", { event: "*", schema: "public", table: "homework_submissions", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadChildActivity())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadChildActivity, selectedMembership?.school_id]);

  const selectedChild = children.find((child) => child.id === selectedStudentId) ?? null;
  const todayAttendance = attendance.find((row) => row.attendance_date === today());
  const markedCount = attendance.filter((row) => row.status !== "pending").length;
  const presentCount = attendance.filter((row) => ["present", "late", "excused"].includes(row.status)).length;
  const attendanceRate = markedCount ? Math.round((presentCount / markedCount) * 100) : 0;
  const pendingHomework = homework.filter((row) => ["pending", "missing"].includes(row.status)).length;

  return (
    <div>
      <PageHeader
        title="Parent Dashboard"
        description={selectedChild ? `${selectedChild.fullName} / ${selectedChild.gradeName} / ${selectedChild.className}` : "Read-only family workspace."}
      />

      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      {children.length > 1 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              {children.map((child) => <option key={child.id} value={child.id}>{child.fullName} / {child.className}</option>)}
            </select>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KPICard title="Linked Children" value={children.length} icon={Users} description="visible through guardian link" colorClass="text-blue-600" />
        <KPICard title="Today" value={todayAttendance?.status ?? "pending"} icon={CalendarCheck2} description={todayAttendance?.time_in ? `time in ${todayAttendance.time_in.slice(0, 5)}` : "attendance status"} colorClass="text-emerald-600" />
        <KPICard title="Attendance Rate" value={`${attendanceRate}%`} icon={Clock} description={`${markedCount} marked records`} colorClass="text-violet-600" />
        <KPICard title="Homework Pending" value={pendingHomework} icon={BookOpen} description="for selected child" colorClass="text-amber-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Homework Status</CardTitle>
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
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Teacher Note</th>
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
