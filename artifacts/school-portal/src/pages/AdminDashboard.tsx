import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertItem } from "@/components/AlertItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, FileText, ClipboardCheck, MessageSquare, Calendar, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const admissionPipeline = [
  { stage: "Applied", count: 34 },
  { stage: "Docs Received", count: 28 },
  { stage: "Interview", count: 18 },
  { stage: "Approved", count: 12 },
  { stage: "Enrolled", count: 8 },
];

const docStatusData = [
  { name: "Complete", value: 22, fill: "hsl(168 65% 38%)" },
  { name: "Partial", value: 8, fill: "hsl(37 90% 55%)" },
  { name: "Missing", value: 4, fill: "hsl(0 72% 51%)" },
];

const recentAdmissions = [
  { name: "Ali Al-Rashidi / علي الراشدي", class: "Grade 9A", date: "05 Jan 2026", status: "Approved" },
  { name: "Layla Al-Harbi / ليلى الحربي", class: "Grade 7B", date: "04 Jan 2026", status: "In Progress" },
  { name: "Saad Al-Qahtani / سعد القحطاني", class: "Grade 11A", date: "04 Jan 2026", status: "Pending" },
  { name: "Dana Al-Mutairi / دانة المطيري", class: "Grade 6C", date: "03 Jan 2026", status: "Approved" },
  { name: "Majed Al-Anzi / ماجد العنزي", class: "Grade 10B", date: "02 Jan 2026", status: "In Progress" },
];

export const AdminDashboard: React.FC = () => {
  return (
    <div>
      <PageHeader title="Admin Dashboard" description="School operations overview — Al-Manar School" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="New Admission Requests" value={8} icon={UserPlus} change="+3 this week" trend="up" colorClass="text-blue-600" />
        <KPICard title="Pending Documents" value={12} icon={FileText} change="4 urgent" trend="down" colorClass="text-amber-600" />
        <KPICard title="Records Needing Update" value={6} icon={Users} trend="neutral" colorClass="text-orange-600" />
        <KPICard title="Attendance Not Submitted" value={3} icon={ClipboardCheck} change="3 classes" trend="down" colorClass="text-red-600" />
        <KPICard title="Unread Parent Messages" value={24} icon={MessageSquare} change="5 high priority" trend="down" colorClass="text-indigo-600" />
        <KPICard title="Exams This Week" value={5} icon={Calendar} change="starting 14 Jan" trend="neutral" colorClass="text-teal-600" />
      </div>

      <div className="mb-6">
        <AlertItem type="warning" message="3 classes have not submitted today's attendance — Grades 5B, 8A, 10C" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admissions Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={admissionPipeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220 60% 30%)" name="Applicants" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={docStatusData} cx="50%" cy="50%" outerRadius={75} paddingAngle={4} dataKey="value">
                  {docStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {docStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  {item.name}: {item.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Admission Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Applied Class</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAdmissions.map((a, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.class}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm" className="h-7 text-xs">Review</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
