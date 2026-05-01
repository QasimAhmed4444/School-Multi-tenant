import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Calendar, Clock } from "lucide-react";

const subjects = [
  { nameEn: "Mathematics", nameAr: "الرياضيات", teacher: "Ahmed Al-Maliki", classes: "G9A, G10B, G11A", days: "Sun, Tue, Thu", credits: 4, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { nameEn: "Arabic Language", nameAr: "اللغة العربية", teacher: "Noura Al-Ghamdi", classes: "G6A, G7B, G8B", days: "Sun, Mon, Wed", credits: 4, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { nameEn: "English Language", nameAr: "اللغة الإنجليزية", teacher: "Hessa Al-Dosari", classes: "G7A, G8C, G9B", days: "Mon, Wed, Thu", credits: 4, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { nameEn: "Science", nameAr: "العلوم", teacher: "Fatima Al-Harbi", classes: "G7A, G8A, G9A", days: "Sun, Tue", credits: 3, color: "bg-teal-100 text-teal-700 border-teal-200" },
  { nameEn: "Islamic Studies", nameAr: "التربية الإسلامية", teacher: "Khalid Al-Zahrani", classes: "G9C, G10A, G11C", days: "Sun, Thu", credits: 2, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { nameEn: "Social Studies", nameAr: "الدراسات الاجتماعية", teacher: "Tariq Al-Rashidi", classes: "G6B, G7C", days: "Mon, Wed", credits: 2, color: "bg-orange-100 text-orange-700 border-orange-200" },
  { nameEn: "Physical Education", nameAr: "التربية البدنية", teacher: "Samir Al-Otaibi", classes: "G6B, G7C, G8A", days: "Tue, Thu", credits: 2, color: "bg-pink-100 text-pink-700 border-pink-200" },
  { nameEn: "Computer Science", nameAr: "الحاسب الآلي", teacher: "Lana Al-Mutairi", classes: "G10A, G11B, G12A", days: "Mon, Wed", credits: 3, color: "bg-violet-100 text-violet-700 border-violet-200" },
  { nameEn: "Art", nameAr: "التربية الفنية", teacher: "Bandar Al-Qahtani", classes: "G6A, G7A, G8C", days: "Tue", credits: 1, color: "bg-rose-100 text-rose-700 border-rose-200" },
  { nameEn: "Geography", nameAr: "الجغرافيا", teacher: "Reem Al-Shammari", classes: "G9B, G10C", days: "Sun, Wed", credits: 2, color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
];

const academicEvents = [
  { date: "14 Jan 2026", event: "Midterm Exams Start", type: "exam" },
  { date: "22 Jan 2026", event: "Midterm Exams End", type: "exam" },
  { date: "28 Jan 2026", event: "Midterm Results Published", type: "result" },
  { date: "1 Feb 2026", event: "Parent-Teacher Meetings", type: "meeting" },
  { date: "15 Feb 2026", event: "Science Fair", type: "event" },
  { date: "1 Mar 2026", event: "Final Exams Preparation", type: "exam" },
  { date: "15 Mar 2026", event: "Final Exams Start", type: "exam" },
];

export const AcademicsPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Academics" description="Subjects, curriculum, and academic calendar for 2025-2026" actionLabel="Add Subject" onAction={() => {}} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {subjects.map((s, i) => (
          <Card key={i} className={`border-l-4 hover:shadow-md transition-shadow`} style={{ borderLeftColor: "" }}>
            <CardContent className="p-4">
              <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold mb-3 border ${s.color}`}>
                <BookOpen className="h-3 w-3" />
                {s.credits} credits
              </div>
              <h3 className="font-semibold text-sm mb-0.5">{s.nameEn}</h3>
              <p className="text-xs text-muted-foreground mb-3" dir="rtl">{s.nameAr}</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>{s.teacher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 shrink-0 opacity-0" />
                  <span>{s.classes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>{s.days}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-base font-semibold mb-4">Academic Calendar — Key Dates</h2>
          <div className="space-y-3">
            {academicEvents.map((e, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="text-xs font-medium text-muted-foreground w-28 shrink-0">{e.date}</div>
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  e.type === "exam" ? "bg-red-500" :
                  e.type === "result" ? "bg-emerald-500" :
                  e.type === "meeting" ? "bg-blue-500" :
                  "bg-amber-500"
                }`} />
                <div className="text-sm font-medium">{e.event}</div>
                <div className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                  e.type === "exam" ? "bg-red-100 text-red-700" :
                  e.type === "result" ? "bg-emerald-100 text-emerald-700" :
                  e.type === "meeting" ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                }`}>{e.type}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
