import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpenCheck, CalendarDays, ClipboardCheck, RefreshCw, Search, Users } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type AttendanceStatus = "pending" | "present" | "absent" | "late" | "excused";
type AttendanceRow = {
  id: string;
  studentName: string;
  className: string;
  classCode: string;
  class_section_id: string;
  teacher_membership_id: string;
  teacherName: string;
  status: AttendanceStatus;
  submitted_at: string | null;
  notes: string | null;
};
type HomeworkRow = {
  id: string;
  title: string;
  className: string;
  classCode: string;
  class_section_id: string;
  teacher_membership_id: string;
  teacherName: string;
  due_date: string;
  status: string;
  total: number;
  submitted: number;
  pending: number;
};

const today = () => new Date().toISOString().slice(0, 10);

export function OperationsPage() {
  const { selectedMembership } = useTenant();
  const [attendanceDate, setAttendanceDate] = React.useState(today());
  const [search, setSearch] = React.useState("");
  const [classFilter, setClassFilter] = React.useState("all");
  const [teacherFilter, setTeacherFilter] = React.useState("all");
  const [attendance, setAttendance] = React.useState<AttendanceRow[]>([]);
  const [homework, setHomework] = React.useState<HomeworkRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadOperations = React.useCallback(async () => {
    if (!selectedMembership?.organization_id || !selectedMembership.school_id) return;
    setLoading(true);
    setError(null);

    const [attendanceResult, homeworkResult] = await Promise.all([
      supabase
        .from("attendance_records")
        .select("id,status,submitted_at,notes,class_section_id,teacher_membership_id,student:students(full_name),class_section:class_sections(name,code),teacher:memberships!attendance_records_teacher_membership_id_fkey(profile:profiles!memberships_profile_id_fkey(full_name,email))")
        .eq("organization_id", selectedMembership.organization_id)
        .eq("school_id", selectedMembership.school_id)
        .eq("attendance_date", attendanceDate)
        .order("created_at", { ascending: true }),
      supabase
        .from("homework_assignments")
        .select("id,title,due_date,status,class_section_id,teacher_membership_id,class_section:class_sections(name,code),teacher:memberships!homework_assignments_teacher_membership_id_fkey(profile:profiles!memberships_profile_id_fkey(full_name,email)),submissions:homework_submissions(status)")
        .eq("organization_id", selectedMembership.organization_id)
        .eq("school_id", selectedMembership.school_id)
        .order("due_date", { ascending: true }),
    ]);

    const firstError = attendanceResult.error ?? homeworkResult.error;
    if (firstError) {
      setError(firstError.message);
      setAttendance([]);
      setHomework([]);
    } else {
      setAttendance(((attendanceResult.data ?? []) as any[]).map((record) => ({
        id: record.id,
        studentName: record.student?.full_name ?? "Student",
        className: record.class_section?.name ?? "Class",
        classCode: record.class_section?.code ?? "Class",
        class_section_id: record.class_section_id,
        teacher_membership_id: record.teacher_membership_id,
        teacherName: record.teacher?.profile?.full_name ?? record.teacher?.profile?.email ?? "Teacher",
        status: record.status,
        submitted_at: record.submitted_at,
        notes: record.notes,
      })));
      setHomework(((homeworkResult.data ?? []) as any[]).map((assignment) => {
        const submissions = assignment.submissions ?? [];
        const submitted = submissions.filter((item: any) => ["submitted", "late", "excused"].includes(item.status)).length;
        return {
          id: assignment.id,
          title: assignment.title,
          className: assignment.class_section?.name ?? "Class",
          classCode: assignment.class_section?.code ?? "Class",
          class_section_id: assignment.class_section_id,
          teacher_membership_id: assignment.teacher_membership_id,
          teacherName: assignment.teacher?.profile?.full_name ?? assignment.teacher?.profile?.email ?? "Teacher",
          due_date: assignment.due_date,
          status: assignment.status,
          total: submissions.length,
          submitted,
          pending: Math.max(0, submissions.length - submitted),
        };
      }));
    }

    setLoading(false);
  }, [attendanceDate, selectedMembership?.organization_id, selectedMembership?.school_id]);

  React.useEffect(() => {
    loadOperations();
  }, [loadOperations]);

  React.useEffect(() => {
    if (!selectedMembership?.school_id) return;
    const channel = supabase
      .channel(`operations-${selectedMembership.school_id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadOperations())
      .on("postgres_changes", { event: "*", schema: "public", table: "homework_submissions", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadOperations())
      .on("postgres_changes", { event: "*", schema: "public", table: "homework_assignments", filter: `school_id=eq.${selectedMembership.school_id}` }, () => loadOperations())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadOperations, selectedMembership?.school_id]);

  const filteredAttendance = attendance.filter((record) => {
    const text = `${record.studentName} ${record.className} ${record.teacherName}`.toLowerCase();
    return text.includes(search.toLowerCase()) && matchesFilter(record.class_section_id, classFilter) && matchesFilter(record.teacher_membership_id, teacherFilter);
  });
  const filteredHomework = homework.filter((assignment) => (
    matchesFilter(assignment.class_section_id, classFilter) && matchesFilter(assignment.teacher_membership_id, teacherFilter)
  ));
  const marked = attendance.filter((record) => record.status !== "pending").length;
  const pendingAttendance = attendance.length - marked;
  const submittedHomework = homework.reduce((sum, item) => sum + item.submitted, 0);
  const pendingHomework = homework.reduce((sum, item) => sum + item.pending, 0);
  const classes = [...new Map([...attendance, ...homework].map((row) => [row.class_section_id, row])).values()];
  const teachers = [...new Map([...attendance, ...homework].map((row) => [row.teacher_membership_id, row])).values()];
  const chartData = teachers.map((teacher) => {
    const teacherAttendance = attendance.filter((row) => row.teacher_membership_id === teacher.teacher_membership_id);
    return {
      teacher: teacher.teacherName.split(" ")[0] || "Teacher",
      marked: teacherAttendance.filter((row) => row.status !== "pending").length,
      pending: teacherAttendance.filter((row) => row.status === "pending").length,
    };
  });

  return (
    <div>
      <PageHeader title="Operations Control" description="Admin oversight for teacher attendance and homework progress across this school." />

      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KPICard title="Attendance Marked" value={`${marked}/${attendance.length}`} icon={ClipboardCheck} description="for selected date" colorClass="text-emerald-600" />
        <KPICard title="Attendance Pending" value={pendingAttendance} icon={Users} description="students unmarked" colorClass="text-amber-600" />
        <KPICard title="Homework Submitted" value={submittedHomework} icon={BookOpenCheck} description="submitted/late/excused" colorClass="text-blue-600" />
        <KPICard title="Homework Pending" value={pendingHomework} icon={CalendarDays} description="open submissions" colorClass="text-rose-600" />
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_180px_220px_220px_auto]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student, teacher, class..." className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm" />
          </div>
          <input type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm" />
          <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All classes</option>
            {classes.map((row) => <option key={row.class_section_id} value={row.class_section_id}>{row.className}</option>)}
          </select>
          <select value={teacherFilter} onChange={(event) => setTeacherFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All teachers</option>
            {teachers.map((row) => <option key={row.teacher_membership_id} value={row.teacher_membership_id}>{row.teacherName}</option>)}
          </select>
          <Button variant="outline" onClick={loadOperations} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Teacher Attendance Progress</CardTitle>
            <CardDescription>Marked versus pending records for the selected date.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="teacher" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="marked" name="Marked" stackId="a" fill="hsl(168 65% 38%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="hsl(37 90% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Homework Progress</CardTitle>
            <CardDescription>Open assignment completion by teacher and class.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Assignment</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Teacher</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Class</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Due</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Progress</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHomework.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No homework found.</td></tr>
                  ) : filteredHomework.map((assignment) => (
                    <tr key={assignment.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="font-medium">{assignment.title}</div>
                        <StatusBadge status={assignment.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{assignment.teacherName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{assignment.className}</td>
                      <td className="px-4 py-3 text-muted-foreground">{assignment.due_date}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 min-w-[90px] rounded-full bg-muted">
                            <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${assignment.total ? Math.round((assignment.submitted / assignment.total) * 100) : 0}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{assignment.submitted}/{assignment.total}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right"><a className="text-sm font-medium text-primary hover:underline" href={`/homework/${assignment.id}`}>Review</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Attendance Review</CardTitle>
          <CardDescription>Read-only admin table. Teachers update records from their attendance view.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Class</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Teacher</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No attendance records found for this filter.</td></tr>
                ) : filteredAttendance.map((record) => (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{record.studentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.className}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.teacherName}</td>
                    <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{record.submitted_at ? new Date(record.submitted_at).toLocaleTimeString() : "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.notes || "-"}</td>
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

function matchesFilter(value: string, filter: string) {
  return filter === "all" || value === filter;
}
