import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const assignments = [
  { subject: "Mathematics", title: "Algebra Chapter 5 Exercises", class: "Grade 9A", assignedDate: "03 Jan 2026", dueDate: "07 Jan 2026", submitted: 28, total: 30, status: "Active" },
  { subject: "English Language", title: "Essay: My Future Goals", class: "Grade 8B", assignedDate: "04 Jan 2026", dueDate: "08 Jan 2026", submitted: 22, total: 25, status: "Active" },
  { subject: "Science", title: "Lab Report: Photosynthesis", class: "Grade 7A", assignedDate: "02 Jan 2026", dueDate: "06 Jan 2026", submitted: 20, total: 20, status: "Completed" },
  { subject: "Arabic Language", title: "Poetry Analysis: Al-Mutanabbi", class: "Grade 10B", assignedDate: "05 Jan 2026", dueDate: "09 Jan 2026", submitted: 15, total: 28, status: "Active" },
  { subject: "Social Studies", title: "Saudi Heritage Project", class: "Grade 6B", assignedDate: "01 Jan 2026", dueDate: "05 Jan 2026", submitted: 18, total: 18, status: "Completed" },
  { subject: "Computer Science", title: "Python Programming Exercise 3", class: "Grade 11B", assignedDate: "03 Jan 2026", dueDate: "10 Jan 2026", submitted: 8, total: 25, status: "Active" },
  { subject: "Islamic Studies", title: "Research: Pillars of Islam", class: "Grade 9C", assignedDate: "02 Jan 2026", dueDate: "07 Jan 2026", submitted: 24, total: 27, status: "Active" },
  { subject: "Mathematics", title: "Geometry: Circle Theorems", class: "Grade 11A", assignedDate: "04 Jan 2026", dueDate: "08 Jan 2026", submitted: 12, total: 30, status: "Active" },
  { subject: "Geography", title: "Map Work: Arabian Peninsula", class: "Grade 9B", assignedDate: "01 Jan 2026", dueDate: "04 Jan 2026", submitted: 22, total: 22, status: "Completed" },
  { subject: "Art", title: "Calligraphy: Traditional Arabic", class: "Grade 7A", assignedDate: "03 Jan 2026", dueDate: "10 Jan 2026", submitted: 10, total: 20, status: "Active" },
];

const submissionData = [
  { name: "Submitted", value: 179, fill: "hsl(168 65% 38%)" },
  { name: "Pending", value: 66, fill: "hsl(37 90% 55%)" },
  { name: "Overdue", value: 23, fill: "hsl(0 72% 51%)" },
];

export const HomeworkPage: React.FC = () => {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? assignments : assignments.filter(a => a.status === filter);

  return (
    <div>
      <PageHeader title="Homework & Assignments" description="Track and manage all class assignments" actionLabel="Add Assignment" onAction={() => {}} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">All Assignments</CardTitle>
              <div className="flex gap-2">
                {["All", "Active", "Completed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                      filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assignment Title</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Submission</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">{a.subject}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{a.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.class}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.dueDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-1.5 min-w-[60px]">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${Math.round(a.submitted / a.total * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{a.submitted}/{a.total}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={submissionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {submissionData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {submissionData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
