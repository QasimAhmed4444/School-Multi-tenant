import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { BookOpen, Clock, Award, Bell } from "lucide-react";

const todayTimetable = [
  { time: "7:30 – 8:30", subject: "Mathematics", teacher: "Ahmed Al-Maliki", room: "Room 201", status: "Completed" },
  { time: "8:30 – 9:30", subject: "Arabic Language", teacher: "Noura Al-Ghamdi", room: "Room 105", status: "Current" },
  { time: "9:30 – 10:30", subject: "Break", teacher: "—", room: "Cafeteria", status: "Break" },
  { time: "10:30 – 11:30", subject: "English Language", teacher: "Hessa Al-Dosari", room: "Room 108", status: "Upcoming" },
  { time: "11:30 – 12:30", subject: "Science", teacher: "Fatima Al-Harbi", room: "Lab 2", status: "Upcoming" },
  { time: "12:30 – 13:30", subject: "Computer Science", teacher: "Lana Al-Mutairi", room: "Lab 1", status: "Upcoming" },
];

const homework = [
  { subject: "Mathematics", title: "Algebra Chapter 5 — Exercises 1-20", due: "Tomorrow", status: "Pending" },
  { subject: "English", title: "Essay: My Future Goals (500 words)", due: "08 Jan 2026", status: "In Progress" },
  { subject: "Arabic", title: "Poetry Analysis: Al-Mutanabbi", due: "09 Jan 2026", status: "Not Started" },
];

const recentResults = [
  { subject: "Mathematics Q1", marks: 88, total: 100, grade: "B+" },
  { subject: "English Q1", marks: 92, total: 100, grade: "A" },
  { subject: "Arabic Q1", marks: 76, total: 100, grade: "B" },
  { subject: "Science Q1", marks: 84, total: 100, grade: "B+" },
];

const announcements = [
  { title: "Midterm Exams Start 14 Jan 2026", type: "info" },
  { title: "Library Book Return Deadline: 10 Jan 2026", type: "warning" },
  { title: "Science Fair Registration Open", type: "info" },
];

export const StudentDashboard: React.FC = () => {
  return (
    <div>
      <PageHeader title="Student Dashboard" description="Welcome, Mohammed Al-Ghamdi — Grade 10A" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(220 15% 90%)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(168 65% 38%)" strokeWidth="3"
                  strokeDasharray={`${94 * 100 / 100} 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">94%</span>
              </div>
            </div>
            <p className="font-semibold">Attendance Rate</p>
            <p className="text-xs text-muted-foreground mt-1">117 of 125 school days present</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-amber-500" /> Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {announcements.map((a, i) => (
              <div key={i} className={`p-2.5 rounded-lg text-sm ${
                a.type === "info" ? "bg-blue-50 border border-blue-100 text-blue-800" : "bg-amber-50 border border-amber-100 text-amber-800"
              }`}>
                {a.title}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-amber-500" /> Recent Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentResults.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm">{r.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{r.marks}/{r.total}</span>
                  <span className="text-sm font-bold text-primary">{r.grade}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /> Today's Timetable</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {todayTimetable.map((slot, i) => (
              <div key={i} className={`flex items-center gap-4 px-4 py-3 border-b last:border-0 ${slot.status === "Current" ? "bg-primary/5 border-l-4 border-l-primary" : ""}`}>
                <div className="text-xs font-medium text-muted-foreground w-24 shrink-0">{slot.time}</div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${slot.status === "Break" ? "text-muted-foreground" : ""}`}>{slot.subject}</div>
                  {slot.teacher !== "—" && <div className="text-xs text-muted-foreground">{slot.teacher} • {slot.room}</div>}
                </div>
                {slot.status !== "Break" && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    slot.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                    slot.status === "Current" ? "bg-primary text-primary-foreground" :
                    "bg-gray-100 text-gray-600"
                  }`}>{slot.status}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-indigo-500" /> Pending Homework</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {homework.map((h, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  h.status === "In Progress" ? "bg-amber-400" :
                  h.status === "Pending" ? "bg-blue-400" :
                  "bg-gray-300"
                }`} />
                <div className="flex-1">
                  <span className="text-xs font-medium text-primary">{h.subject}</span>
                  <p className="text-sm font-medium mt-0.5">{h.title}</p>
                  <p className="text-xs text-muted-foreground">Due: {h.due}</p>
                </div>
                <StatusBadge status={h.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
