import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("school");

  const tabs = [
    { key: "school", label: "School Info" },
    { key: "system", label: "System" },
    { key: "notifications", label: "Notifications" },
    { key: "users", label: "Users & Roles" },
  ];

  return (
    <div>
      <PageHeader title="Settings" description="Configure school information and system preferences" />

      <div className="flex border-b mb-6 overflow-x-auto">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "school" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">School Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "School Name (English)", value: "Al-Manar International School" },
                { label: "School Name (Arabic)", value: "مدرسة المنار الدولية", dir: "rtl" },
                { label: "Ministry License Number", value: "MOE-SAU-2024-0142" },
                { label: "Ministry Registration", value: "REG-RUH-2018-1247" },
                { label: "Principal Name", value: "Dr. Ahmad Al-Faisal" },
                { label: "Academic Year", value: "1446-1447 هـ / 2025-2026 م" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{field.label}</label>
                  <input
                    defaultValue={field.value}
                    dir={field.dir}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Curriculum</label>
                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option>Saudi National Curriculum</option>
                  <option>IB (International Baccalaureate)</option>
                  <option>IGCSE (Cambridge)</option>
                  <option>American Curriculum</option>
                </select>
              </div>
              <Button className="gap-2 mt-2"><Save className="h-4 w-4" /> Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">School Branches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Riyadh Main Campus", address: "Al-Olaya District, Riyadh 12244", phone: "+966 11 234 5678", status: "Active" },
                { name: "Jeddah Branch", address: "Al-Rawdah District, Jeddah 23422", phone: "+966 12 345 6789", status: "Active" },
                { name: "Dammam Campus", address: "Al-Faisaliyah District, Dammam 32243", phone: "+966 13 456 7890", status: "Active" },
              ].map((branch) => (
                <div key={branch.name} className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="font-medium text-sm">{branch.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{branch.address}</div>
                    <div className="text-xs text-muted-foreground">{branch.phone}</div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{branch.status}</span>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2">Add Branch</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "system" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-w-md">
            {[
              { label: "Default Language", options: ["English", "Arabic", "Bilingual (EN/AR)"] },
              { label: "Date Format", options: ["Hijri (هـ)", "Gregorian (م)", "Both (Hijri / Gregorian)"] },
              { label: "Academic Week", options: ["Sunday to Thursday (Saudi)", "Monday to Friday"] },
              { label: "Timezone", options: ["Asia/Riyadh (UTC+3)", "Asia/Jeddah (UTC+3)"] },
              { label: "Currency", options: ["SAR (Saudi Riyal)", "USD (US Dollar)"] },
            ].map((setting) => (
              <div key={setting.label}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{setting.label}</label>
                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {setting.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <Button className="gap-2"><Save className="h-4 w-4" /> Save Preferences</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-w-lg">
            {[
              { label: "SMS Notifications", description: "Send SMS for attendance and fee alerts" },
              { label: "Email Notifications", description: "Send email digests to parents and staff" },
              { label: "WhatsApp Integration", description: "Push alerts via WhatsApp Business API" },
              { label: "Daily Attendance Alert", description: "Notify parents if child is absent" },
              { label: "Fee Overdue Reminder", description: "Send reminders when fee is >7 days overdue" },
              { label: "Exam Reminder", description: "Notify students 3 days before scheduled exams" },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="text-sm font-medium">{setting.label}</div>
                  <div className="text-xs text-muted-foreground">{setting.description}</div>
                </div>
                <button className="relative h-5 w-9 rounded-full bg-primary transition-colors" role="switch">
                  <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-white shadow" />
                </button>
              </div>
            ))}
            <Button className="gap-2"><Save className="h-4 w-4" /> Save Notification Settings</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Users & Role Permissions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Users</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Access Level</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { role: "Principal", users: 1, access: "Full Access", desc: "All modules, reports, and settings" },
                    { role: "Admin", users: 3, access: "High", desc: "Student/teacher management, admissions" },
                    { role: "Teacher", users: 98, access: "Medium", desc: "Classes, attendance, grades, homework" },
                    { role: "Student", users: 1247, access: "Limited", desc: "Own profile, timetable, results" },
                    { role: "Parent", users: 1156, access: "Limited", desc: "Child's info, fees, communication" },
                    { role: "Accountant", users: 2, access: "Finance Only", desc: "Fee collection and financial reports" },
                    { role: "Transport Manager", users: 1, access: "Transport Only", desc: "Bus routes, drivers, transport issues" },
                  ].map((u, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{u.role}</td>
                      <td className="px-4 py-3 font-semibold text-primary">{u.users}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{u.access}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{u.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
