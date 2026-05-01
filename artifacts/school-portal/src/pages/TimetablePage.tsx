import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const timeSlots = ["7:30 – 8:30", "8:30 – 9:30", "9:30 – 10:30", "10:30 – 11:30", "11:30 – 12:30", "12:30 – 13:30"];

const timetableData: Record<string, Record<string, { subject: string; teacher: string; room: string; color: string } | null>> = {
  "Grade 10A": {
    "Sunday-0": { subject: "Mathematics", teacher: "Ahmed Al-Maliki", room: "Room 201", color: "bg-blue-100 border-blue-300 text-blue-900" },
    "Sunday-1": { subject: "Arabic Language", teacher: "Noura Al-Ghamdi", room: "Room 105", color: "bg-emerald-100 border-emerald-300 text-emerald-900" },
    "Sunday-2": null,
    "Sunday-3": { subject: "English Language", teacher: "Hessa Al-Dosari", room: "Room 108", color: "bg-indigo-100 border-indigo-300 text-indigo-900" },
    "Sunday-4": { subject: "Computer Science", teacher: "Lana Al-Mutairi", room: "Lab 1", color: "bg-violet-100 border-violet-300 text-violet-900" },
    "Sunday-5": null,

    "Monday-0": { subject: "Science", teacher: "Fatima Al-Harbi", room: "Lab 2", color: "bg-teal-100 border-teal-300 text-teal-900" },
    "Monday-1": { subject: "Mathematics", teacher: "Ahmed Al-Maliki", room: "Room 201", color: "bg-blue-100 border-blue-300 text-blue-900" },
    "Monday-2": { subject: "Social Studies", teacher: "Tariq Al-Rashidi", room: "Room 110", color: "bg-orange-100 border-orange-300 text-orange-900" },
    "Monday-3": null,
    "Monday-4": { subject: "Art", teacher: "Bandar Al-Qahtani", room: "Art Room", color: "bg-rose-100 border-rose-300 text-rose-900" },
    "Monday-5": { subject: "Arabic Language", teacher: "Noura Al-Ghamdi", room: "Room 105", color: "bg-emerald-100 border-emerald-300 text-emerald-900" },

    "Tuesday-0": { subject: "Physical Education", teacher: "Samir Al-Otaibi", room: "Sports Hall", color: "bg-pink-100 border-pink-300 text-pink-900" },
    "Tuesday-1": { subject: "English Language", teacher: "Hessa Al-Dosari", room: "Room 108", color: "bg-indigo-100 border-indigo-300 text-indigo-900" },
    "Tuesday-2": { subject: "Mathematics", teacher: "Ahmed Al-Maliki", room: "Room 201", color: "bg-blue-100 border-blue-300 text-blue-900" },
    "Tuesday-3": { subject: "Islamic Studies", teacher: "Khalid Al-Zahrani", room: "Room 112", color: "bg-amber-100 border-amber-300 text-amber-900" },
    "Tuesday-4": null,
    "Tuesday-5": { subject: "Geography", teacher: "Reem Al-Shammari", room: "Room 115", color: "bg-cyan-100 border-cyan-300 text-cyan-900" },

    "Wednesday-0": { subject: "Arabic Language", teacher: "Noura Al-Ghamdi", room: "Room 105", color: "bg-emerald-100 border-emerald-300 text-emerald-900" },
    "Wednesday-1": { subject: "Computer Science", teacher: "Lana Al-Mutairi", room: "Lab 1", color: "bg-violet-100 border-violet-300 text-violet-900" },
    "Wednesday-2": { subject: "Science", teacher: "Fatima Al-Harbi", room: "Lab 2", color: "bg-teal-100 border-teal-300 text-teal-900" },
    "Wednesday-3": { subject: "English Language", teacher: "Hessa Al-Dosari", room: "Room 108", color: "bg-indigo-100 border-indigo-300 text-indigo-900" },
    "Wednesday-4": { subject: "Social Studies", teacher: "Tariq Al-Rashidi", room: "Room 110", color: "bg-orange-100 border-orange-300 text-orange-900" },
    "Wednesday-5": null,

    "Thursday-0": { subject: "Mathematics", teacher: "Ahmed Al-Maliki", room: "Room 201", color: "bg-blue-100 border-blue-300 text-blue-900" },
    "Thursday-1": { subject: "Islamic Studies", teacher: "Khalid Al-Zahrani", room: "Room 112", color: "bg-amber-100 border-amber-300 text-amber-900" },
    "Thursday-2": { subject: "Physical Education", teacher: "Samir Al-Otaibi", room: "Sports Hall", color: "bg-pink-100 border-pink-300 text-pink-900" },
    "Thursday-3": { subject: "Geography", teacher: "Reem Al-Shammari", room: "Room 115", color: "bg-cyan-100 border-cyan-300 text-cyan-900" },
    "Thursday-4": { subject: "Art", teacher: "Bandar Al-Qahtani", room: "Art Room", color: "bg-rose-100 border-rose-300 text-rose-900" },
    "Thursday-5": null,
  },
};

const classes = ["Grade 10A", "Grade 10B", "Grade 10C", "Grade 9A", "Grade 9B", "Grade 8A", "Grade 8B", "Grade 7A"];

export const TimetablePage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState("Grade 10A");
  const data = timetableData[selectedClass] || timetableData["Grade 10A"];

  return (
    <div>
      <PageHeader title="Timetable" description="Weekly schedule — Saudi school week: Sunday to Thursday" />

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm font-medium text-muted-foreground">Select Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {classes.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-4 overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(5, 1fr)` }}>
              {/* Header */}
              <div className="font-medium text-xs text-muted-foreground p-2 uppercase tracking-wide">Time Slot</div>
              {days.map((day) => (
                <div key={day} className="font-semibold text-sm text-center p-2 bg-primary/5 rounded-md text-primary">{day}</div>
              ))}

              {/* Rows */}
              {timeSlots.map((slot, slotIdx) => (
                <>
                  <div key={`time-${slotIdx}`} className="text-xs text-muted-foreground p-2 flex items-center font-medium">{slot}</div>
                  {days.map((day) => {
                    const cell = data[`${day}-${slotIdx}`];
                    return (
                      <div key={`${day}-${slotIdx}`} className="p-1">
                        {cell ? (
                          <div className={`rounded-lg border p-2.5 text-xs h-full ${cell.color}`}>
                            <div className="font-semibold mb-0.5">{cell.subject}</div>
                            <div className="opacity-70">{cell.teacher.split(" ")[0]}</div>
                            <div className="opacity-60 mt-0.5">{cell.room}</div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-muted-foreground/20 p-2.5 h-full min-h-[60px] flex items-center justify-center">
                            <span className="text-xs text-muted-foreground/40">Free</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-4">
        {[
          { label: "Mathematics", color: "bg-blue-100 border-blue-300 text-blue-900" },
          { label: "Arabic Language", color: "bg-emerald-100 border-emerald-300 text-emerald-900" },
          { label: "English Language", color: "bg-indigo-100 border-indigo-300 text-indigo-900" },
          { label: "Science", color: "bg-teal-100 border-teal-300 text-teal-900" },
          { label: "Islamic Studies", color: "bg-amber-100 border-amber-300 text-amber-900" },
          { label: "Computer Science", color: "bg-violet-100 border-violet-300 text-violet-900" },
          { label: "Physical Education", color: "bg-pink-100 border-pink-300 text-pink-900" },
          { label: "Art", color: "bg-rose-100 border-rose-300 text-rose-900" },
        ].map((item) => (
          <span key={item.label} className={`text-xs font-medium px-3 py-1 rounded-full border ${item.color}`}>{item.label}</span>
        ))}
      </div>
    </div>
  );
};
