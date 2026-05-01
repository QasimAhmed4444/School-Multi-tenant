import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Clock, UserX } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const studentAttendance = [
  { name: "Mohammed Al-Ghamdi", class: "Grade 10A", status: "Present", time: "7:28 AM", notes: "" },
  { name: "Sarah Al-Otaibi", class: "Grade 8B", status: "Present", time: "7:31 AM", notes: "" },
  { name: "Omar Al-Zahrani", class: "Grade 11C", status: "Absent", time: "—", notes: "Parent notified" },
  { name: "Noura Al-Subai'i", class: "Grade 7A", status: "Late", time: "8:15 AM", notes: "Traffic delay" },
  { name: "Abdullah Al-Shammari", class: "Grade 12A", status: "Present", time: "7:22 AM", notes: "" },
  { name: "Fatima Al-Zahrani", class: "Grade 9B", status: "Excused", time: "—", notes: "Medical appointment" },
  { name: "Khalid Al-Dosari", class: "Grade 10B", status: "Present", time: "7:35 AM", notes: "" },
  { name: "Hessa Al-Qahtani", class: "Grade 6A", status: "Present", time: "7:29 AM", notes: "" },
  { name: "Tariq Al-Rashidi", class: "Grade 11A", status: "Absent", time: "—", notes: "Unexcused" },
  { name: "Lana Al-Harbi", class: "Grade 8A", status: "Late", time: "8:05 AM", notes: "" },
  { name: "Bandar Al-Anzi", class: "Grade 9C", status: "Present", time: "7:27 AM", notes: "" },
  { name: "Reem Al-Mutairi", class: "Grade 7C", status: "Present", time: "7:33 AM", notes: "" },
  { name: "Nasser Al-Shehri", class: "Grade 12B", status: "Present", time: "7:25 AM", notes: "" },
  { name: "Mona Al-Maliki", class: "Grade 6B", status: "Present", time: "7:30 AM", notes: "" },
  { name: "Yousef Al-Ghamdi", class: "Grade 10C", status: "Absent", time: "—", notes: "Sick leave" },
];

const teacherAttendance = [
  { name: "Ahmed Al-Maliki", subject: "Mathematics", status: "Absent", notes: "Sick leave" },
  { name: "Hessa Al-Dosari", subject: "English", status: "Absent", notes: "Family emergency" },
  { name: "Samir Al-Otaibi", subject: "PE", status: "Absent", notes: "Training" },
  { name: "Noura Al-Ghamdi", subject: "Arabic", status: "Present", notes: "" },
  { name: "Khalid Al-Zahrani", subject: "Islamic Studies", status: "Present", notes: "" },
  { name: "Fatima Al-Harbi", subject: "Science", status: "Late", notes: "Arrived 8:10" },
  { name: "Tariq Al-Rashidi", subject: "Social Studies", status: "Present", notes: "" },
  { name: "Lana Al-Mutairi", subject: "Computer Science", status: "Present", notes: "" },
];

const classAttendanceChart = [
  { class: "G6A", pct: 96 }, { class: "G6B", pct: 92 }, { class: "G7A", pct: 88 },
  { class: "G7C", pct: 95 }, { class: "G8A", pct: 91 }, { class: "G8B", pct: 94 },
  { class: "G9A", pct: 87 }, { class: "G9C", pct: 93 }, { class: "G10A", pct: 96 },
  { class: "G10B", pct: 90 }, { class: "G11A", pct: 89 }, { class: "G12B", pct: 97 },
];

export const AttendancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"students" | "teachers">("students");
  const [search, setSearch] = useState("");

  const filtered = studentAttendance.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const present = studentAttendance.filter(s => s.status === "Present").length;
  const absent = studentAttendance.filter(s => s.status === "Absent").length;
  const late = studentAttendance.filter(s => s.status === "Late").length;

  return (
    <div>
      <PageHeader title="Attendance Management" description="Sunday, 5 January 2026 / 5 رجب 1447 هـ" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Present Today" value={present} icon={ClipboardCheck} change={`${Math.round(present/studentAttendance.length*100)}%`} trend="up" colorClass="text-emerald-600" />
        <KPICard title="Absent" value={absent} icon={UserX} change={`${Math.round(absent/studentAttendance.length*100)}%`} trend="down" colorClass="text-red-600" />
        <KPICard title="Late Arrivals" value={late} icon={Clock} trend="neutral" colorClass="text-amber-600" />
        <KPICard title="Classes Submitted" value="12/14" icon={Users} trend="neutral" colorClass="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Class-wise Attendance Today</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classAttendanceChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="class" tick={{ fontSize: 11 }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="pct" fill="hsl(168 65% 38%)" name="Attendance" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="text-sm font-medium text-emerald-800">Present</span>
              <span className="text-xl font-bold text-emerald-700">{present}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-100">
              <span className="text-sm font-medium text-red-800">Absent</span>
              <span className="text-xl font-bold text-red-700">{absent}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
              <span className="text-sm font-medium text-amber-800">Late</span>
              <span className="text-xl font-bold text-amber-700">{late}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
              <span className="text-sm font-medium text-blue-800">Excused</span>
              <span className="text-xl font-bold text-blue-700">1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {(["students", "teachers"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab} Attendance
              </button>
            ))}
          </div>

          <div className="p-4 border-b">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "students" ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time In</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.class}</td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.time}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{s.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherAttendance.map((t, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.subject}</td>
                      <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{t.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
