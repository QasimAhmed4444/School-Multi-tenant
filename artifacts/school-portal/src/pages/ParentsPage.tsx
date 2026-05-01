import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";

const messages = [
  { parent: "Faisal Al-Ghamdi", student: "Mohammed Al-Ghamdi", subject: "Grade 10A Math Progress", date: "05 Jan 2026", status: "Unread", priority: "Normal" },
  { parent: "Nada Al-Otaibi", student: "Sarah Al-Otaibi", subject: "Request for attendance certificate", date: "04 Jan 2026", status: "Read", priority: "Low" },
  { parent: "Khalid Al-Zahrani Sr.", student: "Omar Al-Zahrani", subject: "Bus delay concern - Route 3", date: "04 Jan 2026", status: "Unread", priority: "High" },
  { parent: "Rima Al-Subai'i", student: "Noura Al-Subai'i", subject: "Homework question: Arabic essay", date: "03 Jan 2026", status: "Read", priority: "Normal" },
  { parent: "Sultan Al-Shammari", student: "Abdullah Al-Shammari", subject: "Fee payment plan request", date: "03 Jan 2026", status: "Unread", priority: "High" },
  { parent: "Hind Al-Zahrani", student: "Fatima Al-Zahrani", subject: "Appreciation for Science teacher", date: "02 Jan 2026", status: "Read", priority: "Low" },
  { parent: "Rashed Al-Dosari", student: "Khalid Al-Dosari", subject: "Medical absence notification", date: "02 Jan 2026", status: "Read", priority: "Normal" },
  { parent: "Maha Al-Qahtani", student: "Hessa Al-Qahtani", subject: "Request for exam result review", date: "01 Jan 2026", status: "Unread", priority: "Normal" },
];

const meetings = [
  { parent: "Faisal Al-Ghamdi", student: "Mohammed Al-Ghamdi", teacher: "Ahmed Al-Maliki", date: "08 Jan 2026", time: "10:00 AM", purpose: "Academic Performance Review", status: "Confirmed" },
  { parent: "Sultan Al-Shammari", student: "Abdullah Al-Shammari", teacher: "Finance Office", date: "09 Jan 2026", time: "11:30 AM", purpose: "Fee Payment Discussion", status: "Pending" },
  { parent: "Khalid Al-Zahrani Sr.", student: "Omar Al-Zahrani", teacher: "Transport Manager", date: "10 Jan 2026", time: "9:00 AM", purpose: "Transport Complaint", status: "Confirmed" },
];

export const ParentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"messages" | "meetings" | "announce">("messages");

  return (
    <div>
      <PageHeader title="Parent Communication" description="Messages, meetings, and announcements" actionLabel="Send Announcement" onAction={() => {}} />

      <Card>
        <CardContent className="p-0">
          <div className="flex border-b">
            {[
              { key: "messages", label: "Messages" },
              { key: "meetings", label: "Meeting Requests" },
              { key: "announce", label: "Send Announcement" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {activeTab === "messages" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Parent</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Priority</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map((m, i) => (
                    <tr key={i} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${m.status === "Unread" ? "bg-primary/3 font-medium" : ""}`}>
                      <td className="px-4 py-3 font-medium">{m.parent}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.student}</td>
                      <td className="px-4 py-3">{m.subject}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.date}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          m.priority === "High" ? "bg-red-100 text-red-700" :
                          m.priority === "Low" ? "bg-gray-100 text-gray-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>{m.priority}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                          <MessageSquare className="h-3 w-3" /> Reply
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "meetings" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Parent</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">With</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Purpose</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{m.parent}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.student}</td>
                      <td className="px-4 py-3">{m.teacher}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.date}<br /><span className="text-xs">{m.time}</span></td>
                      <td className="px-4 py-3 text-sm">{m.purpose}</td>
                      <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "announce" && (
            <div className="p-6 max-w-2xl">
              <h3 className="text-sm font-semibold mb-4">Send School Announcement</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Target Audience</label>
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                    <option>All Parents</option>
                    <option>All Students</option>
                    <option>All Staff</option>
                    <option>Grade 10 Parents</option>
                    <option>Grade 11 Parents</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Subject</label>
                  <input className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Announcement subject..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Message</label>
                  <textarea className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[120px] resize-y" placeholder="Write your announcement here..." />
                </div>
                <Button className="gap-2"><Send className="h-4 w-4" /> Send Announcement</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
