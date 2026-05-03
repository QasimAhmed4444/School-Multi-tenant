import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClipboardCheck, Clock, Save, Search, UserX, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/domains/authz/usePermissions";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type AttendanceStatus = "pending" | "present" | "absent" | "late" | "excused";
type AttendanceRow = {
  id: string;
  student_id: string;
  studentName: string;
  className: string;
  classCode: string;
  class_section_id: string;
  teacher_membership_id: string;
  teacherName: string;
  status: AttendanceStatus;
  time_in: string | null;
  notes: string | null;
};

const statusOptions: AttendanceStatus[] = ["pending", "present", "absent", "late", "excused"];
const displayStatus = (status: AttendanceStatus) => status.charAt(0).toUpperCase() + status.slice(1);

export const AttendancePage: React.FC = () => {
  const { selectedMembership } = useTenant();
  const { roleKeys } = usePermissions();
  const isTeacherOnly = roleKeys.includes("teacher") && !roleKeys.some((role) => ["school_admin", "principal", "school_owner", "organization_owner"].includes(role));
  const [records, setRecords] = React.useState<AttendanceRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [classFilter, setClassFilter] = React.useState("all");
  const [teacherFilter, setTeacherFilter] = React.useState("all");
  const [savingId, setSavingId] = React.useState<string | null>(null);

  const loadAttendance = React.useCallback(async () => {
    if (!selectedMembership?.school_id) return;

    let query = supabase
      .from("attendance_records")
      .select("id,student_id,class_section_id,teacher_membership_id,status,time_in,notes,student:students(full_name),class_section:class_sections(name,code),teacher:memberships!attendance_records_teacher_membership_id_fkey(profile:profiles!memberships_profile_id_fkey(full_name,email))")
      .eq("school_id", selectedMembership.school_id)
      .eq("attendance_date", new Date().toISOString().slice(0, 10));

    if (isTeacherOnly) query = query.eq("teacher_membership_id", selectedMembership.id);

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      setRecords([]);
      return;
    }

    setRecords(((data ?? []) as any[]).map((record) => ({
      id: record.id,
      student_id: record.student_id,
      studentName: record.student?.full_name ?? "Student",
      className: record.class_section?.name ?? "Class",
      classCode: record.class_section?.code ?? "Class",
      class_section_id: record.class_section_id,
      teacher_membership_id: record.teacher_membership_id,
      teacherName: record.teacher?.profile?.full_name ?? record.teacher?.profile?.email ?? "Teacher",
      status: record.status,
      time_in: record.time_in,
      notes: record.notes,
    })));
  }, [isTeacherOnly, selectedMembership]);

  React.useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  React.useEffect(() => {
    if (!selectedMembership?.school_id) return;
    const channel = supabase
      .channel(`attendance-${selectedMembership.school_id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "attendance_records", filter: `school_id=eq.${selectedMembership.school_id}` }, () => {
        loadAttendance();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAttendance, selectedMembership?.school_id]);

  const updateLocal = (id: string, patch: Partial<AttendanceRow>) => {
    setRecords((current) => current.map((record) => (record.id === id ? { ...record, ...patch } : record)));
  };

  const saveRecord = async (record: AttendanceRow) => {
    setSavingId(record.id);
    const nextTime = record.status === "present" || record.status === "late" ? record.time_in || new Date().toTimeString().slice(0, 5) : null;
    const { error } = await supabase
      .from("attendance_records")
      .update({
        status: record.status,
        time_in: nextTime,
        notes: record.notes || null,
        submitted_at: record.status === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", record.id);

    if (error) console.error(error);
    setSavingId(null);
    await loadAttendance();
  };

  const filtered = records.filter((record) => {
    const matchesSearch = record.studentName.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === "all" || record.class_section_id === classFilter;
    const matchesTeacher = teacherFilter === "all" || record.teacher_membership_id === teacherFilter;
    return matchesSearch && matchesClass && matchesTeacher;
  });

  const present = records.filter((record) => record.status === "present").length;
  const absent = records.filter((record) => record.status === "absent").length;
  const late = records.filter((record) => record.status === "late").length;
  const excused = records.filter((record) => record.status === "excused").length;
  const pending = records.filter((record) => record.status === "pending").length;
  const classes = [...new Map(records.map((record) => [record.class_section_id, record])).values()];
  const teachers = [...new Map(records.map((record) => [record.teacher_membership_id, record])).values()];
  const chartData = classes.map((row) => {
    const classRecords = records.filter((record) => record.class_section_id === row.class_section_id);
    const marked = classRecords.filter((record) => record.status !== "pending").length;
    return { class: row.classCode, marked, pending: classRecords.length - marked };
  });

  return (
    <div>
      <PageHeader title={isTeacherOnly ? "My Attendance" : "Attendance Management"} description={isTeacherOnly ? "Mark attendance for your assigned classes." : "Monitor student attendance by class and teacher."} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Present Today" value={present} icon={ClipboardCheck} change={`${records.length ? Math.round((present / records.length) * 100) : 0}%`} trend="up" colorClass="text-emerald-600" />
        <KPICard title="Absent" value={absent} icon={UserX} change={`${records.length ? Math.round((absent / records.length) * 100) : 0}%`} trend="down" colorClass="text-red-600" />
        <KPICard title="Late Arrivals" value={late} icon={Clock} trend="neutral" colorClass="text-amber-600" />
        <KPICard title={isTeacherOnly ? "Pending" : "Students Marked"} value={isTeacherOnly ? pending : `${records.length - pending}/${records.length}`} icon={Users} trend="neutral" colorClass="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Class Attendance Progress</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="marked" name="Marked" stackId="a" fill="hsl(168 65% 38%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="hsl(37 90% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Attendance Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Present", present, "bg-emerald-50 border-emerald-100 text-emerald-700"],
              ["Absent", absent, "bg-red-50 border-red-100 text-red-700"],
              ["Late", late, "bg-amber-50 border-amber-100 text-amber-700"],
              ["Excused", excused, "bg-blue-50 border-blue-100 text-blue-700"],
              ["Pending", pending, "bg-slate-50 border-slate-200 text-slate-700"],
            ].map(([label, value, classes]) => (
              <div key={label as string} className={`flex items-center justify-between rounded-lg border p-3 ${classes}`}>
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xl font-bold">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid gap-3 border-b p-4 lg:grid-cols-[1fr_220px_220px]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input type="search" placeholder="Search student..." value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All classes</option>
              {classes.map((row) => <option key={row.class_section_id} value={row.class_section_id}>{row.className}</option>)}
            </select>
            {!isTeacherOnly && (
              <select value={teacherFilter} onChange={(event) => setTeacherFilter(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All teachers</option>
                {teachers.map((row) => <option key={row.teacher_membership_id} value={row.teacher_membership_id}>{row.teacherName}</option>)}
              </select>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student Name</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                  {!isTeacherOnly && <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>}
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time In</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notes</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{record.studentName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.className}</td>
                    {!isTeacherOnly && <td className="px-4 py-3 text-muted-foreground">{record.teacherName}</td>}
                    <td className="px-4 py-3">
                      {isTeacherOnly ? (
                        <select value={record.status} onChange={(event) => updateLocal(record.id, { status: event.target.value as AttendanceStatus })} className="h-8 rounded-md border border-input bg-background px-2 text-sm">
                          {statusOptions.map((status) => <option key={status} value={status}>{displayStatus(status)}</option>)}
                        </select>
                      ) : <StatusBadge status={displayStatus(record.status)} />}
                    </td>
                    <td className="px-4 py-3">
                      {isTeacherOnly ? (
                        <input type="time" value={record.time_in?.slice(0, 5) ?? ""} onChange={(event) => updateLocal(record.id, { time_in: event.target.value })} className="h-8 rounded-md border border-input bg-background px-2 text-sm" />
                      ) : <span className="text-muted-foreground">{record.time_in?.slice(0, 5) || "-"}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {isTeacherOnly ? (
                        <input value={record.notes ?? ""} onChange={(event) => updateLocal(record.id, { notes: event.target.value })} placeholder="Reason or note" className="h-8 min-w-[220px] rounded-md border border-input bg-background px-2 text-sm" />
                      ) : <span className="text-muted-foreground">{record.notes || "-"}</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isTeacherOnly ? (
                        <Button size="sm" variant="outline" onClick={() => saveRecord(record)} disabled={savingId === record.id}>
                          <Save className="mr-2 h-4 w-4" />{savingId === record.id ? "Saving" : "Save"}
                        </Button>
                      ) : <span className="text-xs text-muted-foreground">{record.status === "pending" ? "Not submitted" : "Submitted"}</span>}
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
};
