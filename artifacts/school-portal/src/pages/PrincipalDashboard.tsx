import React from "react";
import {
  Users, GraduationCap, ClipboardCheck, Wallet,
  MessageSquare, UserPlus, TrendingUp, AlertCircle,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { AlertItem } from "@/components/AlertItem";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const attendanceData = [
  { month: "Sep", students: 92, teachers: 98 },
  { month: "Oct", students: 94, teachers: 97 },
  { month: "Nov", students: 91, teachers: 96 },
  { month: "Dec", students: 89, teachers: 95 },
  { month: "Jan", students: 93, teachers: 98 },
  { month: "Feb", students: 95, teachers: 99 },
  { month: "Mar", students: 96, teachers: 98 },
  { month: "Apr", students: 94, teachers: 97 },
  { month: "May", students: 92, teachers: 96 },
];

const feeData = [
  { month: "Sep", collected: 980000, target: 1200000 },
  { month: "Oct", collected: 1100000, target: 1200000 },
  { month: "Nov", collected: 1050000, target: 1200000 },
  { month: "Dec", collected: 890000, target: 1200000 },
  { month: "Jan", collected: 1150000, target: 1200000 },
  { month: "Feb", collected: 1200000, target: 1200000 },
  { month: "Mar", collected: 1234500, target: 1502300 },
];

const classPerformanceData = [
  { grade: "G1", avg: 88 },
  { grade: "G2", avg: 85 },
  { grade: "G3", avg: 82 },
  { grade: "G4", avg: 79 },
  { grade: "G5", avg: 76 },
  { grade: "G6", avg: 81 },
  { grade: "G7", avg: 78 },
  { grade: "G8", avg: 75 },
  { grade: "G9", avg: 73 },
  { grade: "G10", avg: 77 },
  { grade: "G11", avg: 80 },
  { grade: "G12", avg: 82 },
];

const admissionsData = [
  { month: "Sep", new: 45 },
  { month: "Oct", new: 18 },
  { month: "Nov", new: 12 },
  { month: "Dec", new: 8 },
  { month: "Jan", new: 22 },
  { month: "Feb", new: 15 },
  { month: "Mar", new: 23 },
];

const lowPerformingStudents = [
  { name: "Fahad Al-Rashidi / فهد الراشدي", class: "Grade 9A", avg: 48, trend: "down" },
  { name: "Nasser Al-Qahtani / ناصر القحطاني", class: "Grade 8C", avg: 51, trend: "down" },
  { name: "Sara Al-Mutairi / سارة المطيري", class: "Grade 7B", avg: 53, trend: "neutral" },
  { name: "Khalid Al-Dosari / خالد الدوسري", class: "Grade 10B", avg: 55, trend: "up" },
  { name: "Reem Al-Harbi / ريم الحربي", class: "Grade 6A", avg: 57, trend: "neutral" },
];

const pendingFeeStudents = [
  { name: "Abdullah Al-Shamri / عبدالله الشمري", class: "Grade 11A", amount: "SAR 8,400", days: 45 },
  { name: "Tariq Al-Ghamdi / طارق الغامدي", class: "Grade 9C", amount: "SAR 6,200", days: 38 },
  { name: "Fatima Al-Zahrani / فاطمة الزهراني", class: "Grade 8B", amount: "SAR 12,600", days: 62 },
  { name: "Omar Al-Shehri / عمر الشهري", class: "Grade 7A", amount: "SAR 4,800", days: 22 },
  { name: "Nouf Al-Anzi / نوف العنزي", class: "Grade 12B", amount: "SAR 9,100", days: 55 },
];

const absentTeachers = [
  { name: "Ahmed Al-Maliki / أحمد المالكي", subject: "Mathematics", class: "Grade 9A, 10B" },
  { name: "Hessa Al-Dosari / هيصة الدوسري", subject: "English Language", class: "Grade 7A, 8C" },
  { name: "Samir Al-Otaibi / سامر العتيبي", subject: "Physical Education", class: "Grade 6B, 7C" },
];

const recentComplaints = [
  { id: "#C-1042", category: "Transport", subject: "Bus late 30 min daily", priority: "High", status: "Open" },
  { id: "#C-1041", category: "Academic", subject: "Homework overload on Grade 8", priority: "Medium", status: "In Progress" },
  { id: "#C-1040", category: "Fees", subject: "Invoice discrepancy for Q3", priority: "High", status: "Open" },
  { id: "#C-1039", category: "Facility", subject: "AC not working in Lab 3", priority: "Medium", status: "Resolved" },
];

export const PrincipalDashboard: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Principal Dashboard"
        description="Al-Manar School — Riyadh Main Campus | 1446-1447 هـ"
        actionLabel="Download Report"
        onAction={() => {}}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Students" value="1,247" icon={Users} change="+12 this month" trend="up" description="across all branches" colorClass="text-blue-600" />
        <KPICard title="Total Teachers" value="98" icon={GraduationCap} change="+3 this month" trend="up" description="all departments" colorClass="text-indigo-600" />
        <KPICard title="Student Attendance Today" value="94.2%" icon={ClipboardCheck} change="+2.1%" trend="up" description="1,174 of 1,247 present" colorClass="text-emerald-600" />
        <KPICard title="Teacher Attendance Today" value="97.9%" icon={ClipboardCheck} change="+0.5%" trend="up" description="95 of 98 present" colorClass="text-teal-600" />
        <KPICard title="Monthly Fee Collection" value="SAR 1.23M" icon={Wallet} change="82% collected" trend="up" description="of SAR 1.50M target" colorClass="text-violet-600" />
        <KPICard title="Pending Fees" value="SAR 267,800" icon={Wallet} change="18 students" trend="down" description="need follow-up" colorClass="text-amber-600" />
        <KPICard title="Open Complaints" value="14" icon={MessageSquare} change="5 high priority" trend="down" description="awaiting resolution" colorClass="text-red-600" />
        <KPICard title="New Admissions" value="23" icon={UserPlus} change="+8 this week" trend="up" description="this month" colorClass="text-cyan-600" />
      </div>

      {/* Alerts */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Active Alerts & Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <AlertItem type="warning" message="Grade 5B attendance not submitted — Mr. Ahmed Al-Maliki (Mathematics)" />
          <AlertItem type="info" message="Bus Route 3 (Al-Nakheel area) — 15 minute delay reported by driver" />
          <AlertItem type="danger" message="23 students have fees overdue by more than 30 days — SAR 89,400 outstanding" />
          <AlertItem type="warning" message="3 approvals pending your signature — New admissions, Teacher leave requests" />
          <AlertItem type="info" message="Midterm exams start in 5 days — 14 Jan 2026. Timetable published." />
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} unit="%" />
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="hsl(220 60% 30%)" strokeWidth={2} dot={{ r: 4 }} name="Students" />
                <Line type="monotone" dataKey="teachers" stroke="hsl(168 65% 38%)" strokeWidth={2} dot={{ r: 4 }} name="Teachers" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Fee Collection Monthly (SAR)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => `SAR ${v.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="target" fill="hsl(220 15% 90%)" name="Target" radius={[4,4,0,0]} />
                <Bar dataKey="collected" fill="hsl(220 60% 30%)" name="Collected" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Class Performance by Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={classPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis type="number" domain={[60, 100]} tick={{ fontSize: 12 }} unit="%" />
                <YAxis dataKey="grade" type="category" tick={{ fontSize: 11 }} width={28} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="avg" fill="hsl(168 65% 38%)" name="Avg Score" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">New Admissions Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={admissionsData}>
                <defs>
                  <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220 60% 30%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(220 60% 30%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="new" stroke="hsl(220 60% 30%)" fill="url(#admGrad)" strokeWidth={2} name="New Admissions" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Low-performing students */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Low-Performing Students</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Student</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Class</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Avg%</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {lowPerformingStudents.map((s, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.class}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-red-600">{s.avg}%</span>
                      </td>
                      <td className="px-4 py-3">
                        {s.trend === "down" ? <ArrowDownRight className="h-4 w-4 text-red-500" /> :
                         s.trend === "up" ? <ArrowUpRight className="h-4 w-4 text-emerald-500" /> :
                         <TrendingUp className="h-4 w-4 text-muted-foreground" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pending fees */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Pending Fee Students</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Student</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Class</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingFeeStudents.map((s, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.class}</td>
                      <td className="px-4 py-3 font-semibold text-amber-700">{s.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.days > 45 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                          {s.days} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absent teachers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Absent Teachers Today</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Teacher</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Classes</th>
                  </tr>
                </thead>
                <tbody>
                  {absentTeachers.map((t, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{t.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{t.class}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent complaints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Complaints</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">ID</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Priority</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentComplaints.map((c, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                      <td className="px-4 py-3 font-medium">{c.category}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          c.priority === "High" ? "bg-red-100 text-red-700" :
                          c.priority === "Medium" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>{c.priority}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
