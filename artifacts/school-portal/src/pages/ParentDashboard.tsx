import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, XCircle, AlertCircle, Bus, Bell, BookOpen } from "lucide-react";

const homeworkStatus = [
  { subject: "Mathematics", title: "Algebra Exercises", due: "Tomorrow", status: "Submitted" },
  { subject: "English", title: "Essay Writing", due: "08 Jan 2026", status: "In Progress" },
  { subject: "Arabic", title: "Poetry Analysis", due: "09 Jan 2026", status: "Pending" },
];

const examResults = [
  { subject: "Mathematics", marks: 88, total: 100, grade: "B+" },
  { subject: "English", marks: 92, total: 100, grade: "A" },
  { subject: "Arabic", marks: 76, total: 100, grade: "B" },
];

const teacherNotes = [
  { teacher: "Ahmed Al-Maliki", subject: "Mathematics", note: "Mohammed is showing great improvement in algebra. Keep encouraging daily practice.", date: "04 Jan 2026" },
  { teacher: "Hessa Al-Dosari", subject: "English", note: "Excellent essay writing skills. Recommend additional reading for vocabulary growth.", date: "02 Jan 2026" },
];

const announcements = [
  { title: "Midterm exams begin 14 January — please ensure adequate preparation", type: "warning" as const },
  { title: "Parent-Teacher Day scheduled for 1 February 2026", type: "info" as const },
  { title: "Fee payment due by 15 January 2026", type: "danger" as const },
];

export const ParentDashboard: React.FC = () => {
  return (
    <div>
      <PageHeader title="Parent Dashboard" description="Faisal Al-Ghamdi — Parent of Mohammed Al-Ghamdi, Grade 10A" />

      {/* Attendance today */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <Card className="lg:col-span-1 border-emerald-200 bg-emerald-50">
          <CardContent className="p-5 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-emerald-800">Present Today</p>
            <p className="text-xs text-emerald-600">Checked in at 7:28 AM</p>
            <div className="mt-3 text-xs text-emerald-700 font-medium">Monthly: 94% Attendance</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-amber-200 bg-amber-50">
          <CardContent className="p-5 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-amber-800">SAR 6,000</p>
            <p className="text-xs text-amber-600">Pending fee balance</p>
            <div className="mt-3 text-xs text-amber-700 font-medium">Due: 15 January 2026</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-blue-200 bg-blue-50">
          <CardContent className="p-5 text-center">
            <Bus className="h-10 w-10 text-blue-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-800">Route 1</p>
            <p className="text-xs text-blue-600">Mohammad Al-Otaibi (Driver)</p>
            <div className="mt-3 text-xs text-blue-700 font-medium">Dropoff: Expected 3:30 PM</div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <p className="text-sm font-semibold mb-3">Complaint Status</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Bus Delay (#C-1042)</span>
                <span className="font-medium text-red-600">Open</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Billing (#C-1040)</span>
                <span className="font-medium text-amber-600">In Progress</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Homework */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-500" /> Homework Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {homeworkStatus.map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className={`shrink-0 ${h.status === "Submitted" ? "text-emerald-500" : h.status === "In Progress" ? "text-amber-500" : "text-gray-400"}`}>
                  {h.status === "Submitted" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-primary">{h.subject}</div>
                  <div className="text-sm">{h.title}</div>
                  <div className="text-xs text-muted-foreground">Due: {h.due}</div>
                </div>
                <StatusBadge status={h.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Exam Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Exam Results (Q1)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {examResults.map((r, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{r.subject}</span>
                    <span className="text-sm font-bold text-primary">{r.grade}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${r.marks}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{r.marks}/{r.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Teacher Notes + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Teacher Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teacherNotes.map((note, i) => (
              <div key={i} className="p-3 rounded-lg border-l-4 border-primary bg-primary/3">
                <div className="text-xs font-medium text-primary mb-1">{note.teacher} ({note.subject}) — {note.date}</div>
                <p className="text-sm text-foreground">{note.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" /> School Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((a, i) => (
              <div key={i} className={`p-3 rounded-lg border text-sm ${
                a.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
                a.type === "danger" ? "bg-red-50 border-red-200 text-red-800" :
                "bg-blue-50 border-blue-200 text-blue-800"
              }`}>
                {a.title}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
