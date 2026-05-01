import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { KPICard } from "@/components/KPICard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const monthlyRevenue = [
  { month: "Sep", revenue: 980000 },
  { month: "Oct", revenue: 1100000 },
  { month: "Nov", revenue: 1050000 },
  { month: "Dec", revenue: 890000 },
  { month: "Jan", revenue: 1150000 },
  { month: "Feb", revenue: 1200000 },
  { month: "Mar", revenue: 1234500 },
];

const feeRecords = [
  { student: "Mohammed Al-Ghamdi", class: "Grade 10A", total: "SAR 24,000", paid: "SAR 24,000", balance: "SAR 0", status: "Paid", lastPayment: "01 Mar 2026" },
  { student: "Sarah Al-Otaibi", class: "Grade 8B", total: "SAR 24,000", paid: "SAR 18,000", balance: "SAR 6,000", status: "Partial", lastPayment: "15 Feb 2026" },
  { student: "Omar Al-Zahrani", class: "Grade 11C", total: "SAR 24,000", paid: "SAR 0", balance: "SAR 24,000", status: "Unpaid", lastPayment: "—" },
  { student: "Noura Al-Subai'i", class: "Grade 7A", total: "SAR 20,000", paid: "SAR 20,000", balance: "SAR 0", status: "Paid", lastPayment: "28 Feb 2026" },
  { student: "Abdullah Al-Shammari", class: "Grade 12A", total: "SAR 24,000", paid: "SAR 15,600", balance: "SAR 8,400", status: "Overdue", lastPayment: "20 Jan 2026" },
  { student: "Fatima Al-Zahrani", class: "Grade 9B", total: "SAR 24,000", paid: "SAR 24,000", balance: "SAR 0", status: "Paid", lastPayment: "05 Mar 2026" },
  { student: "Khalid Al-Dosari", class: "Grade 10B", total: "SAR 24,000", paid: "SAR 17,800", balance: "SAR 6,200", status: "Partial", lastPayment: "10 Feb 2026" },
  { student: "Hessa Al-Qahtani", class: "Grade 6A", total: "SAR 18,000", paid: "SAR 18,000", balance: "SAR 0", status: "Paid", lastPayment: "01 Mar 2026" },
  { student: "Tariq Al-Rashidi", class: "Grade 11A", total: "SAR 24,000", paid: "SAR 11,400", balance: "SAR 12,600", status: "Overdue", lastPayment: "05 Jan 2026" },
  { student: "Lana Al-Harbi", class: "Grade 8A", total: "SAR 24,000", paid: "SAR 19,200", balance: "SAR 4,800", status: "Partial", lastPayment: "22 Feb 2026" },
  { student: "Bandar Al-Anzi", class: "Grade 9C", total: "SAR 24,000", paid: "SAR 24,000", balance: "SAR 0", status: "Paid", lastPayment: "03 Mar 2026" },
  { student: "Reem Al-Mutairi", class: "Grade 7C", total: "SAR 20,000", paid: "SAR 20,000", balance: "SAR 0", status: "Paid", lastPayment: "28 Feb 2026" },
  { student: "Nasser Al-Shehri", class: "Grade 12B", total: "SAR 24,000", paid: "SAR 14,900", balance: "SAR 9,100", status: "Overdue", lastPayment: "10 Dec 2025" },
  { student: "Mona Al-Maliki", class: "Grade 6B", total: "SAR 18,000", paid: "SAR 18,000", balance: "SAR 0", status: "Paid", lastPayment: "01 Mar 2026" },
  { student: "Yousef Al-Ghamdi", class: "Grade 10C", total: "SAR 24,000", paid: "SAR 24,000", balance: "SAR 0", status: "Paid", lastPayment: "02 Mar 2026" },
];

export const FeesPage: React.FC = () => {
  return (
    <div>
      <PageHeader title="Fees & Finance" description="Academic Year 1446-1447 هـ / 2025-2026 م" actionLabel="Generate Invoice" onAction={() => {}} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Expected" value="SAR 1.50M" icon={Wallet} colorClass="text-blue-600" description="1,247 students" />
        <KPICard title="Collected" value="SAR 1.23M" icon={CheckCircle} change="82.2%" trend="up" colorClass="text-emerald-600" description="of total expected" />
        <KPICard title="Pending" value="SAR 267,800" icon={TrendingUp} change="17.8%" trend="neutral" colorClass="text-amber-600" description="18 students" />
        <KPICard title="Overdue (&gt;30 days)" value="SAR 89,400" icon={AlertCircle} change="5 students" trend="down" colorClass="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Revenue (SAR)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220 60% 30%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(220 60% 30%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v: number) => `SAR ${v.toLocaleString()}`} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(220 60% 30%)" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Collection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Paid in Full", count: 9, color: "bg-emerald-500" },
              { label: "Partial Payment", count: 3, color: "bg-amber-400" },
              { label: "Overdue", count: 3, color: "bg-red-500" },
              { label: "Unpaid", count: 1, color: "bg-gray-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-sm flex-1">{item.label}</span>
                <span className="text-sm font-semibold">{item.count} students</span>
              </div>
            ))}
            <div className="pt-4 border-t mt-2">
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: "60%" }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">60% paid in full</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Student Fee Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Class</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total Fee</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Balance</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Payment</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {feeRecords.map((r, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{r.student}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.class}</td>
                    <td className="px-4 py-3">{r.total}</td>
                    <td className="px-4 py-3 text-emerald-700">{r.paid}</td>
                    <td className={`px-4 py-3 font-semibold ${r.balance === "SAR 0" ? "text-muted-foreground" : "text-amber-700"}`}>{r.balance}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{r.lastPayment}</td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" className="h-7 text-xs">Invoice</Button>
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
