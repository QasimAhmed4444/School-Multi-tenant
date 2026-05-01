import React, { useState } from "react";
import { Search, Filter, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const students = [
  { id: "STU-001", nameEn: "Mohammed Al-Ghamdi", nameAr: "محمد الغامدي", class: "Grade 10A", nationalId: "1098765432", phone: "+966 55 123 4567", status: "Active", branch: "Riyadh Main" },
  { id: "STU-002", nameEn: "Sarah Al-Otaibi", nameAr: "سارة العتيبي", class: "Grade 8B", nationalId: "2109876543", phone: "+966 50 234 5678", status: "Active", branch: "Jeddah Branch" },
  { id: "STU-003", nameEn: "Omar Al-Zahrani", nameAr: "عمر الزهراني", class: "Grade 11C", nationalId: "1098234567", phone: "+966 56 345 6789", status: "Active", branch: "Riyadh Main" },
  { id: "STU-004", nameEn: "Noura Al-Subai'i", nameAr: "نورة السبيعي", class: "Grade 7A", nationalId: "2876543210", phone: "+966 54 456 7890", status: "Active", branch: "Dammam Campus" },
  { id: "STU-005", nameEn: "Abdullah Al-Shammari", nameAr: "عبدالله الشمري", class: "Grade 12A", nationalId: "1087654321", phone: "+966 55 567 8901", status: "Active", branch: "Riyadh Main" },
  { id: "STU-006", nameEn: "Fatima Al-Zahrani", nameAr: "فاطمة الزهراني", class: "Grade 9B", nationalId: "2098765432", phone: "+966 50 678 9012", status: "Active", branch: "Jeddah Branch" },
  { id: "STU-007", nameEn: "Khalid Al-Dosari", nameAr: "خالد الدوسري", class: "Grade 10B", nationalId: "1076543210", phone: "+966 56 789 0123", status: "Inactive", branch: "Riyadh Main" },
  { id: "STU-008", nameEn: "Hessa Al-Qahtani", nameAr: "هيصة القحطاني", class: "Grade 6A", nationalId: "2065432109", phone: "+966 54 890 1234", status: "Active", branch: "Dammam Campus" },
  { id: "STU-009", nameEn: "Tariq Al-Rashidi", nameAr: "طارق الراشدي", class: "Grade 11A", nationalId: "1054321098", phone: "+966 55 901 2345", status: "Active", branch: "Riyadh Main" },
  { id: "STU-010", nameEn: "Lana Al-Harbi", nameAr: "لانا الحربي", class: "Grade 8A", nationalId: "2043210987", phone: "+966 50 012 3456", status: "Active", branch: "Jeddah Branch" },
  { id: "STU-011", nameEn: "Bandar Al-Anzi", nameAr: "بندر العنزي", class: "Grade 9C", nationalId: "1032109876", phone: "+966 56 123 4568", status: "Active", branch: "Riyadh Main" },
  { id: "STU-012", nameEn: "Reem Al-Mutairi", nameAr: "ريم المطيري", class: "Grade 7C", nationalId: "2021098765", phone: "+966 54 234 5679", status: "Active", branch: "Dammam Campus" },
  { id: "STU-013", nameEn: "Nasser Al-Shehri", nameAr: "ناصر الشهري", class: "Grade 12B", nationalId: "1010987654", phone: "+966 55 345 6780", status: "Inactive", branch: "Riyadh Main" },
  { id: "STU-014", nameEn: "Mona Al-Maliki", nameAr: "منى المالكي", class: "Grade 6B", nationalId: "2009876543", phone: "+966 50 456 7891", status: "Active", branch: "Jeddah Branch" },
  { id: "STU-015", nameEn: "Yousef Al-Ghamdi", nameAr: "يوسف الغامدي", class: "Grade 10C", nationalId: "1098761234", phone: "+966 56 567 8902", status: "Active", branch: "Riyadh Main" },
];

const classes = ["All Classes", "Grade 6A", "Grade 6B", "Grade 7A", "Grade 7C", "Grade 8A", "Grade 8B", "Grade 9B", "Grade 9C", "Grade 10A", "Grade 10B", "Grade 10C", "Grade 11A", "Grade 11C", "Grade 12A", "Grade 12B"];
const branches = ["All Branches", "Riyadh Main", "Jeddah Branch", "Dammam Campus"];

export const StudentsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  const filtered = students.filter((s) => {
    const matchSearch = s.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      s.nameAr.includes(search) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.nationalId.includes(search);
    const matchClass = selectedClass === "All Classes" || s.class === selectedClass;
    const matchBranch = selectedBranch === "All Branches" || s.branch === selectedBranch;
    return matchSearch && matchClass && matchBranch;
  });

  return (
    <div>
      <PageHeader
        title="Students Management"
        description={`${students.length} students enrolled across all branches`}
        actionLabel="Add Student"
        onAction={() => {}}
      />

      <Card>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                data-testid="input-student-search"
                type="search"
                placeholder="Search by name, ID, National ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {classes.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {branches.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name (EN / AR)</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">National ID / Iqama</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Branch</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} data-testid={`row-student-${s.id}`} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                          {s.nameEn.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium">{s.nameEn}</div>
                          <div className="text-muted-foreground text-xs" dir="rtl">{s.nameAr}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.class}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.nationalId}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{s.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{s.branch}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Showing {filtered.length} of {students.length} students</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
