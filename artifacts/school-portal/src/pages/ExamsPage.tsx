import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KPICard } from "@/components/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const upcomingExams = [
  { name: "Midterm Mathematics", subject: "Mathematics", class: "Grade 10A", date: "14 Jan 2026", duration: "2 hrs", status: "Scheduled" },
  { name: "Midterm Arabic Language", subject: "Arabic Language", class: "Grade 8B", date: "15 Jan 2026", duration: "2 hrs", status: "Scheduled" },
  { name: "Midterm English", subject: "English Language", class: "Grade 9C", date: "16 Jan 2026", duration: "2 hrs", status: "Scheduled" },
  { name: "Science Practical", subject: "Science", class: "Grade 7A", date: "17 Jan 2026", duration: "1.5 hrs", status: "Scheduled" },
  { name: "Islamic Studies", subject: "Islamic Studies", class: "Grade 11B", date: "18 Jan 2026", duration: "1 hr", status: "Scheduled" },
  { name: "Social Studies Quiz", subject: "Social Studies", class: "Grade 6A", date: "19 Jan 2026", duration: "45 min", status: "Scheduled" },
];

const completedResults = [
  { student: "Mohammed Al-Ghamdi", subject: "Mathematics Q1", marks: 88, total: 100, grade: "B+", result: "Pass" },
  { student: "Sarah Al-Otaibi", subject: "Mathematics Q1", marks: 92, total: 100, grade: "A", result: "Pass" },
  { student: "Omar Al-Zahrani", subject: "Mathematics Q1", marks: 65, total: 100, grade: "C+", result: "Pass" },
  { student: "Noura Al-Subai'i", subject: "English Q1", marks: 95, total: 100, grade: "A+", result: "Pass" },
  { student: "Abdullah Al-Shammari", subject: "Arabic Q1", marks: 78, total: 100, grade: "B", result: "Pass" },
  { student: "Fatima Al-Zahrani", subject: "Science Q1", marks: 82, total: 100, grade: "B+", result: "Pass" },
  { student: "Khalid Al-Dosari", subject: "Mathematics Q1", marks: 45, total: 100, grade: "F", result: "Fail" },
  { student: "Hessa Al-Qahtani", subject: "English Q1", marks: 71, total: 100, grade: "B-", result: "Pass" },
  { student: "Tariq Al-Rashidi", subject: "Science Q1", marks: 58, total: 100, grade: "D+", result: "Pass" },
  { student: "Lana Al-Harbi", subject: "Arabic Q1", marks: 89, total: 100, grade: "A-", result: "Pass" },
];

const gradeDistribution = [
  { grade: "A+ (95-100)", count: 12 },
  { grade: "A (90-94)", count: 28 },
  { grade: "B+ (85-89)", count: 45 },
  { grade: "B (80-84)", count: 38 },
  { grade: "C+ (75-79)", count: 30 },
  { grade: "C (70-74)", count: 22 },
  { grade: "D (60-69)", count: 15 },
  { grade: "F (<60)", count: 8 },
];

export const ExamsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "results">("upcoming");

  return (
    <div>
      <PageHeader title="Exams & Results" description="Academic Year 1446-1447 هـ — Q1 Completed, Midterm Scheduled" actionLabel="Schedule Exam" onAction={() => {}} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Upcoming Exams" value={6} icon={Clock} change="next: 14 Jan" trend="neutral" colorClass="text-blue-600" />
        <KPICard title="Completed Exams" value={12} icon={CheckCircle} change="this quarter" trend="up" colorClass="text-emerald-600" />
        <KPICard title="Average Pass Rate" value="92.4%" icon={Award} change="+3.2%" trend="up" colorClass="text-teal-600" />
        <KPICard title="Failing Students" value={8} icon={AlertCircle} change="need intervention" trend="down" colorClass="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Grade Distribution — Q1 Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(220 60% 30%)" name="Students" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {(["upcoming", "results"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "upcoming" ? "Upcoming Exams" : "Q1 Results"}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            {activeTab === "upcoming" ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Exam Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Duration</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingExams.map((e, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{e.name}</td>
                      <td className="px-4 py-3 text-primary font-medium">{e.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.class}</td>
                      <td className="px-4 py-3">{e.date}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.duration}</td>
                      <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Marks</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Grade</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {completedResults.map((r, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{r.student}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.subject}</td>
                      <td className="px-4 py-3 font-semibold">{r.marks}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.total}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{r.grade}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.result} /></td>
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
