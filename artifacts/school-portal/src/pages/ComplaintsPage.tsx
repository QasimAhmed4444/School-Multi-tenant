import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertCircle, Clock, CheckCircle2, Search, Filter } from "lucide-react";

const complaints = [
  { id: "#C-1042", parent: "Faisal Al-Ghamdi", student: "Mohammed Al-Ghamdi", type: "Transport", subject: "Bus Route 3 consistently 15-20 min late", date: "04 Jan 2026", assigned: "Transport Dept.", priority: "High", status: "Open" },
  { id: "#C-1041", parent: "Nada Al-Otaibi", student: "Sarah Al-Otaibi", type: "Academic", subject: "Excessive homework assigned for Grade 8", date: "04 Jan 2026", assigned: "Grade 8 Teacher", priority: "Medium", status: "In Progress" },
  { id: "#C-1040", parent: "Sultan Al-Shammari", student: "Abdullah Al-Shammari", type: "Fees", subject: "Billing discrepancy — charged twice for Q3", date: "03 Jan 2026", assigned: "Finance Dept.", priority: "High", status: "Open" },
  { id: "#C-1039", parent: "Rima Al-Subai'i", student: "Noura Al-Subai'i", type: "Facility", subject: "AC not working in Science Lab 3", date: "02 Jan 2026", assigned: "Maintenance", priority: "Medium", status: "Resolved" },
  { id: "#C-1038", parent: "Maha Al-Qahtani", student: "Hessa Al-Qahtani", type: "Behavior", subject: "Bullying incident reported in cafeteria", date: "02 Jan 2026", assigned: "Principal Office", priority: "High", status: "In Progress" },
  { id: "#C-1037", parent: "Hind Al-Zahrani", student: "Fatima Al-Zahrani", type: "Academic", subject: "Exam result review request — Science Q1", date: "01 Jan 2026", assigned: "Science Dept.", priority: "Low", status: "Resolved" },
  { id: "#C-1036", parent: "Rashed Al-Dosari", student: "Khalid Al-Dosari", type: "General", subject: "Request for student ID replacement", date: "31 Dec 2025", assigned: "Admin Office", priority: "Low", status: "Resolved" },
  { id: "#C-1035", parent: "Layla Al-Anzi", student: "Bandar Al-Anzi", type: "Transport", subject: "Driver behavior complaint — Route 5", date: "30 Dec 2025", assigned: "Transport Dept.", priority: "High", status: "In Progress" },
  { id: "#C-1034", parent: "Dina Al-Harbi", student: "Lana Al-Harbi", type: "Fees", subject: "Request for payment installment plan", date: "29 Dec 2025", assigned: "Finance Dept.", priority: "Medium", status: "Resolved" },
  { id: "#C-1033", parent: "Ahmad Al-Rashidi", student: "Tariq Al-Rashidi", type: "Academic", subject: "Missed exam due to medical emergency", date: "28 Dec 2025", assigned: "Academic Dept.", priority: "Medium", status: "Resolved" },
  { id: "#C-1032", parent: "Reem Al-Shammari", student: "Nasser Al-Shehri", type: "Facility", subject: "Water cooler broken near Grade 12 wing", date: "27 Dec 2025", assigned: "Maintenance", priority: "Low", status: "Resolved" },
  { id: "#C-1031", parent: "Sara Al-Ghamdi", student: "Yousef Al-Ghamdi", type: "Academic", subject: "Grade appeal for final Q1 Mathematics", date: "26 Dec 2025", assigned: "Math Dept.", priority: "Medium", status: "In Progress" },
];

const types = ["All Types", "Academic", "Fees", "Transport", "Behavior", "Facility", "General"];
const statuses = ["All Status", "Open", "In Progress", "Resolved"];
const priorities = ["All Priority", "High", "Medium", "Low"];

export const ComplaintsPage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [search, setSearch] = useState("");

  const filtered = complaints.filter((c) => {
    const matchType = typeFilter === "All Types" || c.type === typeFilter;
    const matchStatus = statusFilter === "All Status" || c.status === statusFilter;
    const matchPriority = priorityFilter === "All Priority" || c.priority === priorityFilter;
    const matchSearch = c.subject.toLowerCase().includes(search.toLowerCase()) || c.parent.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchPriority && matchSearch;
  });

  const open = complaints.filter(c => c.status === "Open").length;
  const inProgress = complaints.filter(c => c.status === "In Progress").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const high = complaints.filter(c => c.priority === "High").length;

  return (
    <div>
      <PageHeader title="Complaints & Requests" description="Track and resolve parent and student complaints" actionLabel="Add Complaint" onAction={() => {}} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Open" value={open} icon={AlertCircle} change="need action" trend="down" colorClass="text-red-600" />
        <KPICard title="In Progress" value={inProgress} icon={Clock} change="being handled" trend="neutral" colorClass="text-amber-600" />
        <KPICard title="Resolved" value={resolved} icon={CheckCircle2} change="this month" trend="up" colorClass="text-emerald-600" />
        <KPICard title="High Priority" value={high} icon={MessageSquare} change="urgent" trend="down" colorClass="text-orange-600" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search complaints..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                {priorities.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Parent / Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assigned To</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Priority</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.parent}</div>
                      <div className="text-xs text-muted-foreground">{c.student}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">{c.type}</span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="truncate">{c.subject}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.date}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.assigned}</td>
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

          <div className="px-4 py-3 border-t text-sm text-muted-foreground">
            Showing {filtered.length} of {complaints.length} complaints
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
