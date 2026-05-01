import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ClipboardCheck, FileText, Users, AlertCircle, Calendar } from "lucide-react";

const myClasses = [
  { class: "Grade 9A", subject: "Mathematics", students: 30, todayTime: "8:30 – 9:30", room: "Room 201", attendanceStatus: "Not Submitted" },
  { class: "Grade 10B", subject: "Mathematics", students: 28, todayTime: "9:30 – 10:30", room: "Room 201", attendanceStatus: "Submitted" },
  { class: "Grade 11A", subject: "Mathematics", students: 30, todayTime: "11:30 – 12:30", room: "Room 201", attendanceStatus: "Not Submitted" },
];

const absentStudents = [
  { name: "Fahad Al-Rashidi", class: "Grade 9A", parentNotified: true },
  { name: "Nasser Al-Qahtani", class: "Grade 10B", parentNotified: false },
  { name: "Sara Al-Mutairi", class: "Grade 11A", parentNotified: true },
];

const parentMessages = [
  { parent: "Faisal Al-Ghamdi", student: "Mohammed Al-Ghamdi", msg: "Is there extra math homework tonight?", time: "9:05 AM" },
  { parent: "Rima Al-Subai'i", student: "Omar Al-Zahrani", msg: "Request for absent work packet from yesterday", time: "8:42 AM" },
];

export const TeacherDashboard: React.FC = () => {
  return (
    <div>
      <PageHeader title="Teacher Dashboard" description="Welcome, Ahmed Al-Maliki — Mathematics Department" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <KPICard title="Today's Classes" value={3} icon={BookOpen} change="next at 9:30 AM" trend="neutral" colorClass="text-blue-600" />
        <KPICard title="Attendance Pending" value={2} icon={ClipboardCheck} change="Grade 9A, 11A" trend="down" colorClass="text-amber-600" />
        <KPICard title="Homework Assigned" value={8} icon={FileText} change="3 due today" trend="neutral" colorClass="text-indigo-600" />
        <KPICard title="Submissions Received" value="6/8" icon={FileText} change="75% rate" trend="up" colorClass="text-teal-600" />
        <KPICard title="Absent Students Today" value={3} icon={Users} change="across all classes" trend="down" colorClass="text-red-600" />
        <KPICard title="Low-Performing Students" value={4} icon={AlertCircle} change="need attention" trend="down" colorClass="text-orange-600" />
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="gap-2"><ClipboardCheck className="h-4 w-4" /> Mark Attendance</Button>
            <Button variant="outline" className="gap-2"><FileText className="h-4 w-4" /> Add Homework</Button>
            <Button variant="outline" className="gap-2"><BookOpen className="h-4 w-4" /> Enter Marks</Button>
            <Button variant="outline" className="gap-2"><Users className="h-4 w-4" /> Message Parent</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">My Classes Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myClasses.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{c.class} — {c.subject}</div>
                    <div className="text-xs text-muted-foreground">{c.todayTime} • {c.room} • {c.students} students</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    c.attendanceStatus === "Submitted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {c.attendanceStatus}
                  </span>
                  <Button size="sm" variant="outline" className="h-7 text-xs">Mark</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Absent Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {absentStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-red-50 border border-red-100">
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.class}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.parentNotified ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                    {s.parentNotified ? "Notified" : "Notify"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Parent Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {parentMessages.map((m, i) => (
                <div key={i} className="p-3 rounded-lg border">
                  <div className="text-xs font-medium text-primary mb-1">{m.parent} <span className="text-muted-foreground font-normal">re: {m.student}</span></div>
                  <div className="text-sm">{m.msg}</div>
                  <div className="text-xs text-muted-foreground mt-1">{m.time}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
