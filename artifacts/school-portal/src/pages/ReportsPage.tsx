import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, GraduationCap, Wallet, Award, BarChart2,
  MessageSquare, Bus, UserPlus, FileText, Download
} from "lucide-react";

const reports = [
  {
    title: "Student Attendance Report",
    description: "Daily, weekly, and monthly student attendance breakdown by class and branch",
    icon: Users,
    color: "text-blue-600 bg-blue-100",
    lastGenerated: "05 Jan 2026",
    format: "PDF / Excel"
  },
  {
    title: "Teacher Attendance Report",
    description: "Staff presence records, leave summary, and absent day analysis",
    icon: GraduationCap,
    color: "text-indigo-600 bg-indigo-100",
    lastGenerated: "05 Jan 2026",
    format: "PDF / Excel"
  },
  {
    title: "Monthly Fee Collection Report",
    description: "Revenue collection, pending payments, overdue accounts, and installment tracking",
    icon: Wallet,
    color: "text-emerald-600 bg-emerald-100",
    lastGenerated: "01 Jan 2026",
    format: "PDF / Excel"
  },
  {
    title: "Exam Results Report",
    description: "Student exam performance, grade distribution, pass/fail analysis by subject",
    icon: Award,
    color: "text-amber-600 bg-amber-100",
    lastGenerated: "28 Dec 2025",
    format: "PDF / Excel"
  },
  {
    title: "Class Performance Report",
    description: "Average scores, subject rankings, class comparison, and improvement trends",
    icon: BarChart2,
    color: "text-teal-600 bg-teal-100",
    lastGenerated: "28 Dec 2025",
    format: "PDF / Excel"
  },
  {
    title: "Parent Communication Report",
    description: "Message volume, complaint categories, resolution rates, and parent satisfaction metrics",
    icon: MessageSquare,
    color: "text-rose-600 bg-rose-100",
    lastGenerated: "04 Jan 2026",
    format: "PDF / Excel"
  },
  {
    title: "Transport Activity Report",
    description: "Route efficiency, bus capacity utilization, delays, and driver performance",
    icon: Bus,
    color: "text-cyan-600 bg-cyan-100",
    lastGenerated: "04 Jan 2026",
    format: "PDF / Excel"
  },
  {
    title: "New Admissions Report",
    description: "Application pipeline, enrollment conversion rates, branch-wise intake stats",
    icon: UserPlus,
    color: "text-violet-600 bg-violet-100",
    lastGenerated: "01 Jan 2026",
    format: "PDF / Excel"
  },
  {
    title: "Monthly Principal Summary",
    description: "Executive dashboard: KPIs across all domains for the principal's monthly review",
    icon: FileText,
    color: "text-orange-600 bg-orange-100",
    lastGenerated: "01 Jan 2026",
    format: "PDF"
  },
];

export const ReportsPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Reports" description="Generate and download management reports for Al-Manar School" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${report.color}`}>
                  <report.icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-muted-foreground">{report.format}</span>
              </div>
              <h3 className="font-semibold text-sm mb-1.5">{report.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{report.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last: {report.lastGenerated}</span>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5">
                  <Download className="h-3 w-3" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
