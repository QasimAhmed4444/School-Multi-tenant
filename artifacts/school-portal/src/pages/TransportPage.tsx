import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Users, MapPin, AlertTriangle } from "lucide-react";

const routes = [
  { route: "Route 1", area: "Riyadh North - Al-Nakheel", driver: "Mohammad Al-Otaibi", plate: "ABC 1234", capacity: 35, students: 32, status: "At School", phone: "+966 55 111 2222" },
  { route: "Route 2", area: "Riyadh South - Al-Rawabi", driver: "Fahad Al-Rashidi", plate: "DEF 5678", capacity: 40, students: 38, status: "On Route", phone: "+966 55 333 4444" },
  { route: "Route 3", area: "Al-Nakheel District", driver: "Saeed Al-Ghamdi", plate: "GHI 9012", capacity: 35, students: 30, status: "Delayed", phone: "+966 55 555 6666" },
  { route: "Route 4", area: "Olaya District", driver: "Tariq Al-Harbi", plate: "JKL 3456", capacity: 40, students: 35, status: "At School", phone: "+966 55 777 8888" },
  { route: "Route 5", area: "Al-Malaz District", driver: "Omar Al-Qahtani", plate: "MNO 7890", capacity: 35, students: 28, status: "On Route", phone: "+966 55 999 0000" },
  { route: "Route 6", area: "Al-Waha Compound", driver: "Yousef Al-Zahrani", plate: "PQR 1234", capacity: 30, students: 25, status: "At School", phone: "+966 56 111 2233" },
  { route: "Route 7", area: "Al-Rayyan District", driver: "Ahmed Al-Shammari", plate: "STU 5678", capacity: 40, students: 37, status: "On Route", phone: "+966 56 333 4455" },
  { route: "Route 8", area: "Al-Wadi Area", driver: "Hassan Al-Anzi", plate: "VWX 9012", capacity: 35, students: 27, status: "At School", phone: "+966 56 555 6677" },
];

const issues = [
  { route: "Route 3", issue: "15-minute delay reported — heavy traffic on King Fahad Road", time: "7:45 AM", severity: "Medium" },
  { route: "Route 2", issue: "AC malfunction reported — driver notified maintenance", time: "7:30 AM", severity: "Low" },
  { route: "Route 7", issue: "Student forgot ID card, parent notified", time: "8:00 AM", severity: "Low" },
];

export const TransportPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Transport Management" description="Live bus route tracking and fleet management" actionLabel="Add Route" onAction={() => {}} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Active Buses" value={12} icon={Bus} change="all operational" trend="up" colorClass="text-blue-600" />
        <KPICard title="Total Routes" value={8} icon={MapPin} change="Riyadh area" trend="neutral" colorClass="text-teal-600" />
        <KPICard title="Drivers On Duty" value={12} icon={Users} change="all checked in" trend="up" colorClass="text-emerald-600" />
        <KPICard title="Students Transported" value="342" icon={Users} change="27.4% of total" trend="neutral" colorClass="text-indigo-600" />
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Active Transport Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-md bg-white border border-amber-200">
                <span className="text-xs font-semibold text-amber-700 shrink-0 mt-0.5">{issue.route}</span>
                <span className="text-sm text-amber-900 flex-1">{issue.issue}</span>
                <span className="text-xs text-amber-600 shrink-0">{issue.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bus Routes Status</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Route</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Area</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Driver</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Bus Plate</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Capacity</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Students</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-primary">{r.route}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.area}</td>
                    <td className="px-4 py-3 font-medium">{r.driver}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.plate}</td>
                    <td className="px-4 py-3 text-center">{r.capacity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{r.students}</span>
                        <div className="flex-1 bg-muted rounded-full h-1.5 min-w-[40px]">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.round(r.students/r.capacity*100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{r.phone}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
