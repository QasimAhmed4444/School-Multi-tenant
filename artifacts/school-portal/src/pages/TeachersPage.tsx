import React, { useState } from "react";
import { Search, Filter, Eye, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const teachers = [
  { id: "TCH-001", nameEn: "Ahmed Al-Maliki", nameAr: "أحمد المالكي", subject: "Mathematics", classes: "Grade 9A, 10B, 11A", qualification: "M.Sc. Mathematics", status: "Active", branch: "Riyadh Main", experience: "8 years" },
  { id: "TCH-002", nameEn: "Hessa Al-Dosari", nameAr: "هيصة الدوسري", subject: "English Language", classes: "Grade 7A, 8C, 9B", qualification: "B.Ed. English", status: "Active", branch: "Jeddah Branch", experience: "5 years" },
  { id: "TCH-003", nameEn: "Samir Al-Otaibi", nameAr: "سامر العتيبي", subject: "Physical Education", classes: "Grade 6B, 7C, 8A", qualification: "B.Sc. Sports Science", status: "Active", branch: "Riyadh Main", experience: "3 years" },
  { id: "TCH-004", nameEn: "Noura Al-Ghamdi", nameAr: "نورة الغامدي", subject: "Arabic Language", classes: "Grade 6A, 7B, 8B", qualification: "M.A. Arabic Literature", status: "Active", branch: "Riyadh Main", experience: "12 years" },
  { id: "TCH-005", nameEn: "Khalid Al-Zahrani", nameAr: "خالد الزهراني", subject: "Islamic Studies", classes: "Grade 9C, 10A, 11C", qualification: "B.A. Sharia", status: "Active", branch: "Dammam Campus", experience: "10 years" },
  { id: "TCH-006", nameEn: "Fatima Al-Harbi", nameAr: "فاطمة الحربي", subject: "Science", classes: "Grade 7A, 8A, 9A", qualification: "M.Sc. Biology", status: "Active", branch: "Jeddah Branch", experience: "7 years" },
  { id: "TCH-007", nameEn: "Tariq Al-Rashidi", nameAr: "طارق الراشدي", subject: "Social Studies", classes: "Grade 6B, 7C", qualification: "B.A. Geography", status: "Inactive", branch: "Riyadh Main", experience: "4 years" },
  { id: "TCH-008", nameEn: "Lana Al-Mutairi", nameAr: "لانا المطيري", subject: "Computer Science", classes: "Grade 10A, 11B, 12A", qualification: "B.Sc. Computer Science", status: "Active", branch: "Riyadh Main", experience: "6 years" },
  { id: "TCH-009", nameEn: "Bandar Al-Qahtani", nameAr: "بندر القحطاني", subject: "Art", classes: "Grade 6A, 7A, 8C", qualification: "B.F.A. Fine Arts", status: "Active", branch: "Dammam Campus", experience: "9 years" },
  { id: "TCH-010", nameEn: "Reem Al-Shammari", nameAr: "ريم الشمري", subject: "Geography", classes: "Grade 9B, 10C", qualification: "M.A. Geography", status: "Active", branch: "Riyadh Main", experience: "11 years" },
];

const subjects = ["All Subjects", "Mathematics", "English Language", "Physical Education", "Arabic Language", "Islamic Studies", "Science", "Social Studies", "Computer Science", "Art", "Geography"];
const branches = ["All Branches", "Riyadh Main", "Jeddah Branch", "Dammam Campus"];

export const TeachersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  const filtered = teachers.filter((t) => {
    const matchSearch = t.nameEn.toLowerCase().includes(search.toLowerCase()) || t.nameAr.includes(search);
    const matchSubject = selectedSubject === "All Subjects" || t.subject === selectedSubject;
    const matchBranch = selectedBranch === "All Branches" || t.branch === selectedBranch;
    return matchSearch && matchSubject && matchBranch;
  });

  return (
    <div>
      <PageHeader
        title="Teachers Management"
        description={`${teachers.length} teachers across all branches`}
        actionLabel="Add Teacher"
        onAction={() => {}}
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search teachers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {subjects.map((s) => <option key={s}>{s}</option>)}
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

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Classes</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Qualification</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Experience</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Branch</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-accent/15 flex items-center justify-center text-accent font-semibold text-xs shrink-0">
                          {t.nameEn.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium">{t.nameEn}</div>
                          <div className="text-muted-foreground text-xs" dir="rtl">{t.nameAr}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-primary">{t.subject}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px]">{t.classes}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.qualification}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.experience}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.branch}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Showing {filtered.length} of {teachers.length} teachers</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
