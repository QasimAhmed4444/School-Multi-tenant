import React from "react";
import { Building2, GraduationCap, MapPinned, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/domains/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/KPICard";

type Counts = {
  organizations: number;
  schools: number;
  campuses: number;
  profiles: number;
  memberships: number;
};

async function getCount(table: keyof Counts) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export function PlatformDashboard() {
  const { profile, signOut } = useAuth();
  const [counts, setCounts] = React.useState<Counts>({ organizations: 0, schools: 0, campuses: 0, profiles: 0, memberships: 0 });
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    Promise.all([
      getCount("organizations"),
      getCount("schools"),
      getCount("campuses"),
      getCount("profiles"),
      getCount("memberships"),
    ])
      .then(([organizations, schools, campuses, profiles, memberships]) => {
        setCounts({ organizations, schools, campuses, profiles, memberships });
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Unable to load platform analytics"));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">Platform Super Admin</div>
              <div className="text-xs text-muted-foreground">{profile?.email}</div>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>Sign out</Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-muted-foreground">Global SaaS control plane for organizations, schools, admin seats, and support operations.</p>
        </div>

        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KPICard title="Organizations" value={String(counts.organizations)} icon={Building2} colorClass="text-blue-600" description="registered tenants" />
          <KPICard title="Schools" value={String(counts.schools)} icon={GraduationCap} colorClass="text-emerald-600" description="across all organizations" />
          <KPICard title="Campuses" value={String(counts.campuses)} icon={MapPinned} colorClass="text-amber-600" description="physical locations" />
          <KPICard title="Profiles" value={String(counts.profiles)} icon={Users} colorClass="text-violet-600" description="auth-linked users" />
          <KPICard title="Memberships" value={String(counts.memberships)} icon={ShieldCheck} colorClass="text-cyan-600" description="tenant access records" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Foundation Status</CardTitle>
            <CardDescription>This phase intentionally exposes only platform analytics. Organization creation UI comes after the first Super Admin is assigned.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {["RLS enabled on foundation tables", "RBAC seeded with system roles", "Tenant context ready for UI migration"].map((item) => (
              <div key={item} className="rounded-md border bg-muted/40 p-4 text-sm font-medium">{item}</div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
