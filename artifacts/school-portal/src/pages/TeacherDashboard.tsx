import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BookOpen, ClipboardCheck, Clock, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useTenant } from "@/domains/tenant/TenantProvider";

type ClassRow = { id: string; name: string; code: string; subject: string; students: number; pending: number; completed: number };

export const TeacherDashboard: React.FC = () => {
  const { selectedMembership } = useTenant();
  const [classes, setClasses] = React.useState<ClassRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadDashboard = React.useCallback(async () => {
    if (!selectedMembership?.id || !selectedMembership.school_id) return;
    setLoading(true);

    const { data: assignments, error: assignmentError } = await supabase
      .from("teacher_assignments")
      .select("class_section_id, class_section:class_sections(id,name,code), subject:subjects(name)")
      .eq("teacher_membership_id", selectedMembership.id)
      .eq("status", "active");

    if (assignmentError) {
      console.error(assignmentError);
      setClasses([]);
      setLoading(false);
      return;
    }

    const classIds = [...new Set((assignments ?? []).map((row: any) => row.class_section_id).filter(Boolean))];
    if (classIds.length === 0) {
      setClasses([]);
      setLoading(false);
      return;
    }

    const [{ data: students }, { data: records }] = await Promise.all([
      supabase.from("students").select("id,class_section_id").in("class_section_id", classIds).eq("enrollment_status", "active"),
      supabase
        .from("attendance_records")
        .select("id,class_section_id,status")
        .eq("teacher_membership_id", selectedMembership.id)
        .eq("attendance_date", new Date().toISOString().slice(0, 10)),
    ]);

    const nextClasses = (assignments ?? []).map((assignment: any) => {
      const section = assignment.class_section;
      const studentCount = (students ?? []).filter((student: any) => student.class_section_id === assignment.class_section_id).length;
      const classRecords = (records ?? []).filter((record: any) => record.class_section_id === assignment.class_section_id);
      const pending = classRecords.filter((record: any) => record.status === "pending").length;
      return {
        id: assignment.class_section_id,
        name: section?.name ?? "Class",
        code: section?.code ?? "Class",
        subject: assignment.subject?.name ?? "Subject",
        students: studentCount,
        pending,
        completed: Math.max(0, studentCount - pending),
      };
    });

    setClasses(nextClasses);
    setLoading(false);
  }, [selectedMembership]);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalStudents = classes.reduce((sum, row) => sum + row.students, 0);
  const pendingAttendance = classes.reduce((sum, row) => sum + row.pending, 0);
  const completedAttendance = Math.max(0, totalStudents - pendingAttendance);
  const pieData = [
    { name: "Marked", value: completedAttendance, fill: "hsl(168 65% 38%)" },
    { name: "Pending", value: pendingAttendance, fill: "hsl(37 90% 55%)" },
  ];

  return (
    <div>
      <PageHeader title="Teacher Dashboard" description="Your assigned classes, students, and today's attendance progress." />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <KPICard title="Total Students" value={loading ? "..." : totalStudents} icon={Users} change="in assigned classes" trend="neutral" colorClass="text-blue-600" />
        <KPICard title="Assigned Classes" value={loading ? "..." : classes.length} icon={BookOpen} change={classes.map((row) => row.code).join(", ") || "No class assigned"} trend="neutral" colorClass="text-emerald-600" />
        <KPICard title="Attendance Pending" value={loading ? "..." : pendingAttendance} icon={Clock} change="students not marked today" trend={pendingAttendance > 0 ? "down" : "up"} colorClass="text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr] mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Progress by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={classes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="code" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="completed" name="Marked" stackId="a" fill="hsl(168 65% 38%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="hsl(37 90% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={86} paddingAngle={3}>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {classes.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">No classes assigned yet. Admin must assign this teacher to class sections.</div>
          ) : classes.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold">{row.name} / {row.subject}</div>
                <div className="text-sm text-muted-foreground">{row.students} students / {row.pending} attendance pending</div>
              </div>
              <Button asChild size="sm">
                <a href="/attendance"><ClipboardCheck className="mr-2 h-4 w-4" />Take attendance</a>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
