import React from "react";
import { Building2, GraduationCap, MapPinned, Plus, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/domains/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KPICard } from "@/components/KPICard";

type Counts = {
  organizations: number;
  schools: number;
  campuses: number;
  profiles: number;
  memberships: number;
};

type OrganizationRow = {
  id: string;
  name: string;
  org_code: string;
  status: string;
  created_at: string;
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function getCount(table: keyof Counts) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export function PlatformDashboard() {
  const { profile, signOut } = useAuth();
  const [counts, setCounts] = React.useState<Counts>({ organizations: 0, schools: 0, campuses: 0, profiles: 0, memberships: 0 });
  const [organizations, setOrganizations] = React.useState<OrganizationRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    organizationName: "",
    orgCode: "",
    schoolName: "",
    schoolCode: "",
    campusName: "Main Campus",
    campusCode: "MAIN",
    countryCode: "SA",
    currency: "SAR",
    timezone: "Asia/Riyadh",
    maxSchools: "1",
    maxCampuses: "1",
    maxAdminUsers: "1",
    planKey: "starter",
  });

  const loadDashboard = React.useCallback(() => {
    setError(null);
    Promise.all([
      getCount("organizations"),
      getCount("schools"),
      getCount("campuses"),
      getCount("profiles"),
      getCount("memberships"),
      supabase
        .from("organizations")
        .select("id,name,org_code,status,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ])
      .then(([organizationCount, schools, campuses, profiles, memberships, organizationRows]) => {
        setCounts({ organizations: organizationCount, schools, campuses, profiles, memberships });
        if (organizationRows.error) throw organizationRows.error;
        setOrganizations((organizationRows.data ?? []) as OrganizationRow[]);
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Unable to load platform analytics"));
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const createOrganization = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const organizationSlug = slugify(form.organizationName);
      const schoolSlug = slugify(form.schoolName);
      const campusSlug = slugify(form.campusName);

      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .insert({
          name: form.organizationName.trim(),
          slug: organizationSlug,
          org_code: form.orgCode.trim().toUpperCase(),
          status: "active",
          country_code: form.countryCode.trim().toUpperCase(),
          default_currency: form.currency.trim().toUpperCase(),
          default_timezone: form.timezone.trim(),
          default_locale: "en",
        })
        .select("id,name")
        .single();

      if (organizationError) throw organizationError;

      const { error: entitlementError } = await supabase.from("organization_entitlements").insert({
        organization_id: organization.id,
        plan_key: form.planKey.trim().toLowerCase(),
        status: "active",
        max_schools: Number(form.maxSchools),
        max_campuses: Number(form.maxCampuses),
        max_admin_users: Number(form.maxAdminUsers),
      });

      if (entitlementError) throw entitlementError;

      const { data: school, error: schoolError } = await supabase
        .from("schools")
        .insert({
          organization_id: organization.id,
          name: form.schoolName.trim(),
          slug: schoolSlug,
          school_code: form.schoolCode.trim().toUpperCase(),
          status: "active",
          country_code: form.countryCode.trim().toUpperCase(),
          currency: form.currency.trim().toUpperCase(),
          timezone: form.timezone.trim(),
          locale: "en",
        })
        .select("id,name")
        .single();

      if (schoolError) throw schoolError;

      if (form.campusName.trim()) {
        const { error: campusError } = await supabase.from("campuses").insert({
          organization_id: organization.id,
          school_id: school.id,
          name: form.campusName.trim(),
          slug: campusSlug,
          campus_code: form.campusCode.trim().toUpperCase(),
          status: "active",
        });

        if (campusError) throw campusError;
      }

      await supabase.from("audit_logs").insert({
        organization_id: organization.id,
        actor_profile_id: profile?.id,
        action: "platform.organization.created",
        target_table: "organizations",
        target_id: organization.id,
        metadata: { school_id: school.id, plan_key: form.planKey },
      });

      setSuccess(`${organization.name} and ${school.name} created.`);
      setForm((current) => ({
        ...current,
        organizationName: "",
        orgCode: "",
        schoolName: "",
        schoolCode: "",
        campusName: "Main Campus",
        campusCode: "MAIN",
      }));
      loadDashboard();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create organization");
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadDashboard}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-muted-foreground">Global SaaS control plane for organizations, schools, admin seats, and support operations.</p>
        </div>

        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KPICard title="Organizations" value={String(counts.organizations)} icon={Building2} colorClass="text-blue-600" description="registered tenants" />
          <KPICard title="Schools" value={String(counts.schools)} icon={GraduationCap} colorClass="text-emerald-600" description="across all organizations" />
          <KPICard title="Campuses" value={String(counts.campuses)} icon={MapPinned} colorClass="text-amber-600" description="physical locations" />
          <KPICard title="Profiles" value={String(counts.profiles)} icon={Users} colorClass="text-violet-600" description="auth-linked users" />
          <KPICard title="Memberships" value={String(counts.memberships)} icon={ShieldCheck} colorClass="text-cyan-600" description="tenant access records" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Create Organization + First School</CardTitle>
              <CardDescription>Create the paying tenant, set admin-seat limits, and create its first school/campus.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createOrganization} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization name</Label>
                    <Input id="organizationName" value={form.organizationName} onChange={(event) => updateForm("organizationName", event.target.value)} placeholder="Alburhan Group" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgCode">Org code</Label>
                    <Input id="orgCode" value={form.orgCode} onChange={(event) => updateForm("orgCode", event.target.value)} placeholder="ALBURHAN" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">First school name</Label>
                    <Input id="schoolName" value={form.schoolName} onChange={(event) => updateForm("schoolName", event.target.value)} placeholder="Alburhan International School" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolCode">School code</Label>
                    <Input id="schoolCode" value={form.schoolCode} onChange={(event) => updateForm("schoolCode", event.target.value)} placeholder="AIS" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campusName">Campus</Label>
                    <Input id="campusName" value={form.campusName} onChange={(event) => updateForm("campusName", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="campusCode">Campus code</Label>
                    <Input id="campusCode" value={form.campusCode} onChange={(event) => updateForm("campusCode", event.target.value)} required />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="planKey">Plan</Label>
                    <Input id="planKey" value={form.planKey} onChange={(event) => updateForm("planKey", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxSchools">Max schools</Label>
                    <Input id="maxSchools" type="number" min="1" value={form.maxSchools} onChange={(event) => updateForm("maxSchools", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCampuses">Max campuses</Label>
                    <Input id="maxCampuses" type="number" min="1" value={form.maxCampuses} onChange={(event) => updateForm("maxCampuses", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAdminUsers">Admin seats</Label>
                    <Input id="maxAdminUsers" type="number" min="1" value={form.maxAdminUsers} onChange={(event) => updateForm("maxAdminUsers", event.target.value)} required />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="countryCode">Country</Label>
                    <Input id="countryCode" value={form.countryCode} onChange={(event) => updateForm("countryCode", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" value={form.currency} onChange={(event) => updateForm("currency", event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" value={form.timezone} onChange={(event) => updateForm("timezone", event.target.value)} required />
                  </div>
                </div>

                <Button type="submit" disabled={saving}>
                  <Plus className="mr-2 h-4 w-4" />
                  {saving ? "Creating..." : "Create organization"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registered Organizations</CardTitle>
              <CardDescription>Latest tenants created on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {organizations.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">No organizations yet. Create the first customer tenant from the form.</div>
              ) : (
                organizations.map((organization) => (
                  <div key={organization.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="font-medium">{organization.name}</div>
                      <div className="text-xs text-muted-foreground">{organization.org_code}</div>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{organization.status}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Foundation Status</CardTitle>
            <CardDescription>Foundation is live. This screen now starts the real Super Admin onboarding flow.</CardDescription>
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
