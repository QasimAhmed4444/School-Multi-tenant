import React from "react";
import { Building2, GraduationCap, MapPinned, Plus, RefreshCw, School, ShieldCheck, UserPlus, Users } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/domains/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";

type Counts = { organizations: number; schools: number; campuses: number; profiles: number; memberships: number };
type Organization = {
  id: string;
  name: string;
  org_code: string;
  status: string;
  country_code: string | null;
  default_currency: string | null;
  default_timezone: string | null;
};
type Entitlement = { plan_key: string; status: string; max_schools: number; max_admin_users: number };
type SchoolRow = { id: string; name: string; school_code: string; status: string; currency: string | null; timezone: string | null };
type AdminRow = { id: string; profileId: string; name: string; email: string; school: string; roles: string[] };

const emptyCounts: Counts = { organizations: 0, schools: 0, campuses: 0, profiles: 0, memberships: 0 };
const adminRoleKeys = new Set(["organization_owner", "school_owner", "principal", "school_admin"]);
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function count(table: keyof Counts) {
  const { count: value, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return value ?? 0;
}

function Field(props: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <Input id={props.id} type={props.type ?? "text"} value={props.value} onChange={(event) => props.onChange(event.target.value)} placeholder={props.placeholder} required />
    </div>
  );
}

export function PlatformDashboard() {
  const { profile, signOut } = useAuth();
  const [counts, setCounts] = React.useState<Counts>(emptyCounts);
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = React.useState<string | null>(null);
  const [entitlement, setEntitlement] = React.useState<Entitlement | null>(null);
  const [schools, setSchools] = React.useState<SchoolRow[]>([]);
  const [admins, setAdmins] = React.useState<AdminRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [orgForm, setOrgForm] = React.useState({
    organizationName: "",
    orgCode: "",
    schoolName: "",
    schoolCode: "",
    campusName: "Main Campus",
    campusCode: "MAIN",
    countryCode: "SA",
    currency: "SAR",
    timezone: "Asia/Riyadh",
    planKey: "starter",
    maxSchools: "1",
    maxCampuses: "1",
    maxAdminUsers: "1",
  });
  const [schoolForm, setSchoolForm] = React.useState({ schoolName: "", schoolCode: "", campusName: "Main Campus", campusCode: "MAIN" });
  const [adminForm, setAdminForm] = React.useState({ schoolId: "", email: "" });

  const selectedOrg = organizations.find((org) => org.id === selectedOrgId) ?? null;
  const usedAdminSeats = new Set(admins.map((admin) => admin.profileId)).size;

  const updateOrgForm = (key: keyof typeof orgForm, value: string) => setOrgForm((current) => ({ ...current, [key]: value }));
  const updateSchoolForm = (key: keyof typeof schoolForm, value: string) => setSchoolForm((current) => ({ ...current, [key]: value }));
  const updateAdminForm = (key: keyof typeof adminForm, value: string) => setAdminForm((current) => ({ ...current, [key]: value }));

  const loadOrgDetails = React.useCallback(async (organizationId: string) => {
    const [entitlementResult, schoolsResult, membershipsResult] = await Promise.all([
      supabase.from("organization_entitlements").select("plan_key,status,max_schools,max_admin_users").eq("organization_id", organizationId).maybeSingle(),
      supabase.from("schools").select("id,name,school_code,status,currency,timezone").eq("organization_id", organizationId).order("name"),
      supabase
        .from("memberships")
        .select("id,profile_id,status,profile:profiles(email,full_name),school:schools(name),membership_roles(role:roles(key,name))")
        .eq("organization_id", organizationId)
        .eq("status", "active"),
    ]);

    if (entitlementResult.error) throw entitlementResult.error;
    if (schoolsResult.error) throw schoolsResult.error;
    if (membershipsResult.error) throw membershipsResult.error;

    const nextSchools = (schoolsResult.data ?? []) as SchoolRow[];
    const nextAdmins = ((membershipsResult.data ?? []) as any[])
      .map((membership) => {
        const roles = (membership.membership_roles ?? []).map((item: any) => item.role).filter((role: any) => role && adminRoleKeys.has(role.key));
        if (roles.length === 0) return null;
        return {
          id: membership.id,
          profileId: membership.profile_id,
          name: membership.profile?.full_name ?? "Unnamed user",
          email: membership.profile?.email ?? "No email",
          school: membership.school?.name ?? "All schools",
          roles: roles.map((role: any) => role.name),
        };
      })
      .filter(Boolean) as AdminRow[];

    setEntitlement((entitlementResult.data ?? null) as Entitlement | null);
    setSchools(nextSchools);
    setAdmins(nextAdmins);
    setAdminForm((current) => ({ ...current, schoolId: current.schoolId || nextSchools[0]?.id || "" }));
  }, []);

  const loadDashboard = React.useCallback(async () => {
    setError(null);
    try {
      const [organizationsCount, schoolsCount, campusesCount, profilesCount, membershipsCount, organizationRows] = await Promise.all([
        count("organizations"),
        count("schools"),
        count("campuses"),
        count("profiles"),
        count("memberships"),
        supabase.from("organizations").select("id,name,org_code,status,country_code,default_currency,default_timezone").order("created_at", { ascending: false }),
      ]);
      if (organizationRows.error) throw organizationRows.error;

      const nextOrganizations = (organizationRows.data ?? []) as Organization[];
      const nextSelectedOrgId = selectedOrgId && nextOrganizations.some((org) => org.id === selectedOrgId) ? selectedOrgId : nextOrganizations[0]?.id ?? null;
      setCounts({ organizations: organizationsCount, schools: schoolsCount, campuses: campusesCount, profiles: profilesCount, memberships: membershipsCount });
      setOrganizations(nextOrganizations);
      setSelectedOrgId(nextSelectedOrgId);

      if (nextSelectedOrgId) await loadOrgDetails(nextSelectedOrgId);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load platform dashboard");
    }
  }, [loadOrgDetails, selectedOrgId]);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  React.useEffect(() => {
    if (!selectedOrgId) return;
    loadOrgDetails(selectedOrgId).catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Unable to load organization"));
  }, [loadOrgDetails, selectedOrgId]);

  const createOrganization = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("org");
    setError(null);
    setSuccess(null);

    try {
      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .insert({
          name: orgForm.organizationName.trim(),
          slug: slugify(orgForm.organizationName),
          org_code: orgForm.orgCode.trim().toUpperCase(),
          status: "active",
          country_code: orgForm.countryCode.trim().toUpperCase(),
          default_currency: orgForm.currency.trim().toUpperCase(),
          default_timezone: orgForm.timezone.trim(),
          default_locale: "en",
        })
        .select("id,name")
        .single();
      if (organizationError) throw organizationError;

      const { error: entitlementError } = await supabase.from("organization_entitlements").insert({
        organization_id: organization.id,
        plan_key: orgForm.planKey.trim().toLowerCase(),
        status: "active",
        max_schools: Number(orgForm.maxSchools),
        max_campuses: Number(orgForm.maxCampuses),
        max_admin_users: Number(orgForm.maxAdminUsers),
      });
      if (entitlementError) throw entitlementError;

      const { data: school, error: schoolError } = await supabase
        .from("schools")
        .insert({
          organization_id: organization.id,
          name: orgForm.schoolName.trim(),
          slug: slugify(orgForm.schoolName),
          school_code: orgForm.schoolCode.trim().toUpperCase(),
          status: "active",
          country_code: orgForm.countryCode.trim().toUpperCase(),
          currency: orgForm.currency.trim().toUpperCase(),
          timezone: orgForm.timezone.trim(),
          locale: "en",
        })
        .select("id,name")
        .single();
      if (schoolError) throw schoolError;

      await supabase.from("campuses").insert({
        organization_id: organization.id,
        school_id: school.id,
        name: orgForm.campusName.trim(),
        slug: slugify(orgForm.campusName),
        campus_code: orgForm.campusCode.trim().toUpperCase(),
        status: "active",
      });
      await supabase.from("audit_logs").insert({
        organization_id: organization.id,
        actor_profile_id: profile?.id,
        action: "platform.organization.created",
        target_table: "organizations",
        target_id: organization.id,
        metadata: { school_id: school.id },
      });

      setSelectedOrgId(organization.id);
      setAdminForm({ schoolId: school.id, email: "" });
      setSuccess(`${organization.name} created. Now assign the first school admin below.`);
      setOrgForm((current) => ({ ...current, organizationName: "", orgCode: "", schoolName: "", schoolCode: "", campusName: "Main Campus", campusCode: "MAIN" }));
      await loadDashboard();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create organization");
    } finally {
      setBusy(null);
    }
  };

  const createSchool = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrg) return;
    if (entitlement && schools.length >= entitlement.max_schools) {
      setError(`School limit reached for this plan (${schools.length}/${entitlement.max_schools}).`);
      return;
    }

    setBusy("school");
    setError(null);
    setSuccess(null);
    try {
      const { data: school, error: schoolError } = await supabase
        .from("schools")
        .insert({
          organization_id: selectedOrg.id,
          name: schoolForm.schoolName.trim(),
          slug: slugify(schoolForm.schoolName),
          school_code: schoolForm.schoolCode.trim().toUpperCase(),
          status: "active",
          country_code: selectedOrg.country_code ?? "SA",
          currency: selectedOrg.default_currency ?? "SAR",
          timezone: selectedOrg.default_timezone ?? "Asia/Riyadh",
          locale: "en",
        })
        .select("id,name")
        .single();
      if (schoolError) throw schoolError;

      await supabase.from("campuses").insert({
        organization_id: selectedOrg.id,
        school_id: school.id,
        name: schoolForm.campusName.trim(),
        slug: slugify(schoolForm.campusName),
        campus_code: schoolForm.campusCode.trim().toUpperCase(),
        status: "active",
      });
      setAdminForm((current) => ({ ...current, schoolId: school.id }));
      setSchoolForm({ schoolName: "", schoolCode: "", campusName: "Main Campus", campusCode: "MAIN" });
      setSuccess(`${school.name} created under ${selectedOrg.name}.`);
      await Promise.all([loadDashboard(), loadOrgDetails(selectedOrg.id)]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create school");
    } finally {
      setBusy(null);
    }
  };

  const assignAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedOrg) return;
    setBusy("admin");
    setError(null);
    setSuccess(null);
    try {
      const { error: rpcError } = await supabase.rpc("assign_school_admin_by_email", {
        org_id: selectedOrg.id,
        sch_id: adminForm.schoolId,
        admin_email: adminForm.email.trim().toLowerCase(),
      });
      if (rpcError) throw rpcError;
      setSuccess(`${adminForm.email.trim()} is now a school admin.`);
      setAdminForm((current) => ({ ...current, email: "" }));
      await Promise.all([loadDashboard(), loadOrgDetails(selectedOrg.id)]);
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : "Unable to assign school admin";
      setError(message.includes("Profile not found") ? "That email must sign up once before you can assign it. Invite automation is the next backend step." : message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></div>
            <div><div className="font-semibold">Platform Super Admin</div><div className="text-xs text-muted-foreground">{profile?.email}</div></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadDashboard}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
            <Button variant="outline" onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 lg:p-8">
        <div><h1 className="text-3xl font-bold tracking-tight">Platform Dashboard</h1><p className="text-muted-foreground">Create tenants, manage schools, sell admin seats, and assign school operators.</p></div>
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        {success && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KPICard title="Organizations" value={String(counts.organizations)} icon={Building2} colorClass="text-blue-600" description="registered tenants" />
          <KPICard title="Schools" value={String(counts.schools)} icon={GraduationCap} colorClass="text-emerald-600" description="across all organizations" />
          <KPICard title="Campuses" value={String(counts.campuses)} icon={MapPinned} colorClass="text-amber-600" description="physical locations" />
          <KPICard title="Profiles" value={String(counts.profiles)} icon={Users} colorClass="text-violet-600" description="auth-linked users" />
          <KPICard title="Memberships" value={String(counts.memberships)} icon={ShieldCheck} colorClass="text-cyan-600" description="tenant access records" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader><CardTitle>Create Organization + First School</CardTitle><CardDescription>Create the paying customer, first school, campus, and admin-seat limits.</CardDescription></CardHeader>
            <CardContent>
              <form onSubmit={createOrganization} className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field id="org-name" label="Organization name" value={orgForm.organizationName} onChange={(value) => updateOrgForm("organizationName", value)} placeholder="Alburhan Group" />
                  <Field id="org-code" label="Org code" value={orgForm.orgCode} onChange={(value) => updateOrgForm("orgCode", value)} placeholder="ALBURHAN" />
                  <Field id="school-name" label="First school name" value={orgForm.schoolName} onChange={(value) => updateOrgForm("schoolName", value)} placeholder="Alburhan International School" />
                  <Field id="school-code" label="School code" value={orgForm.schoolCode} onChange={(value) => updateOrgForm("schoolCode", value)} placeholder="AIS" />
                  <Field id="campus-name" label="Campus" value={orgForm.campusName} onChange={(value) => updateOrgForm("campusName", value)} />
                  <Field id="campus-code" label="Campus code" value={orgForm.campusCode} onChange={(value) => updateOrgForm("campusCode", value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-4">
                  <Field id="plan" label="Plan" value={orgForm.planKey} onChange={(value) => updateOrgForm("planKey", value)} />
                  <Field id="max-schools" label="Max schools" type="number" value={orgForm.maxSchools} onChange={(value) => updateOrgForm("maxSchools", value)} />
                  <Field id="max-campuses" label="Max campuses" type="number" value={orgForm.maxCampuses} onChange={(value) => updateOrgForm("maxCampuses", value)} />
                  <Field id="max-admins" label="Admin seats" type="number" value={orgForm.maxAdminUsers} onChange={(value) => updateOrgForm("maxAdminUsers", value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field id="country" label="Country" value={orgForm.countryCode} onChange={(value) => updateOrgForm("countryCode", value)} />
                  <Field id="currency" label="Currency" value={orgForm.currency} onChange={(value) => updateOrgForm("currency", value)} />
                  <Field id="timezone" label="Timezone" value={orgForm.timezone} onChange={(value) => updateOrgForm("timezone", value)} />
                </div>
                <Button type="submit" disabled={busy === "org"}><Plus className="mr-2 h-4 w-4" />{busy === "org" ? "Creating..." : "Create organization"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Registered Organizations</CardTitle><CardDescription>Select one to manage schools and admins.</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {organizations.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">No organizations yet.</div> : organizations.map((org) => (
                <button key={org.id} type="button" onClick={() => setSelectedOrgId(org.id)} className={`flex w-full items-center justify-between rounded-md border p-3 text-left transition ${org.id === selectedOrgId ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                  <div><div className="font-medium">{org.name}</div><div className="text-xs text-muted-foreground">{org.org_code}</div></div>
                  <div className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{org.status}</div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {selectedOrg && (
          <Card>
            <CardHeader><CardTitle>{selectedOrg.name} Control Center</CardTitle><CardDescription>Manage this tenant after the sale: schools, purchased admin seats, and school admin access.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-md border bg-muted/30 p-4"><div className="text-xs font-medium uppercase text-muted-foreground">Plan</div><div className="mt-2 text-2xl font-bold">{entitlement?.plan_key ?? "No plan"}</div><div className="text-xs text-muted-foreground">{entitlement?.status ?? "missing"}</div></div>
                <div className="rounded-md border bg-muted/30 p-4"><div className="text-xs font-medium uppercase text-muted-foreground">Schools</div><div className="mt-2 text-2xl font-bold">{schools.length}/{entitlement?.max_schools ?? 0}</div><div className="text-xs text-muted-foreground">licensed count</div></div>
                <div className="rounded-md border bg-muted/30 p-4"><div className="text-xs font-medium uppercase text-muted-foreground">Admin seats</div><div className="mt-2 text-2xl font-bold">{usedAdminSeats}/{entitlement?.max_admin_users ?? 0}</div><div className="text-xs text-muted-foreground">billable operators</div></div>
                <div className="rounded-md border bg-muted/30 p-4"><div className="text-xs font-medium uppercase text-muted-foreground">Region</div><div className="mt-2 text-2xl font-bold">{selectedOrg.country_code ?? "Global"}</div><div className="text-xs text-muted-foreground">{selectedOrg.default_currency ?? "currency"} / {selectedOrg.default_timezone ?? "timezone"}</div></div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><School className="h-5 w-5 text-emerald-600" />Add School</CardTitle><CardDescription>Create another school if the plan allows it.</CardDescription></CardHeader>
                  <CardContent>
                    <form onSubmit={createSchool} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field id="new-school" label="School name" value={schoolForm.schoolName} onChange={(value) => updateSchoolForm("schoolName", value)} placeholder="Second Branch School" />
                        <Field id="new-school-code" label="School code" value={schoolForm.schoolCode} onChange={(value) => updateSchoolForm("schoolCode", value)} placeholder="SBS" />
                        <Field id="new-campus" label="Campus" value={schoolForm.campusName} onChange={(value) => updateSchoolForm("campusName", value)} />
                        <Field id="new-campus-code" label="Campus code" value={schoolForm.campusCode} onChange={(value) => updateSchoolForm("campusCode", value)} />
                      </div>
                      <Button type="submit" disabled={busy === "school" || Boolean(entitlement && schools.length >= entitlement.max_schools)}><Plus className="mr-2 h-4 w-4" />{busy === "school" ? "Creating..." : "Create school"}</Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><UserPlus className="h-5 w-5 text-blue-600" />Assign School Admin</CardTitle><CardDescription>Assign an existing signed-up user to one selected school.</CardDescription></CardHeader>
                  <CardContent>
                    <form onSubmit={assignAdmin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin-school">School</Label>
                        <select id="admin-school" value={adminForm.schoolId} onChange={(event) => updateAdminForm("schoolId", event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                          {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
                        </select>
                      </div>
                      <Field id="admin-email" label="Admin email" type="email" value={adminForm.email} onChange={(value) => updateAdminForm("email", value)} placeholder="admin@school.com" />
                      <Button type="submit" disabled={busy === "admin" || schools.length === 0 || Boolean(entitlement && usedAdminSeats >= entitlement.max_admin_users)}><ShieldCheck className="mr-2 h-4 w-4" />{busy === "admin" ? "Assigning..." : "Assign admin"}</Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Schools</CardTitle><CardDescription>Schools under this organization.</CardDescription></CardHeader>
                  <CardContent className="space-y-3">{schools.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">No schools found.</div> : schools.map((school) => <div key={school.id} className="flex items-center justify-between rounded-md border p-3"><div><div className="font-medium">{school.name}</div><div className="text-xs text-muted-foreground">{school.school_code} / {school.currency ?? "currency"} / {school.timezone ?? "timezone"}</div></div><div className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{school.status}</div></div>)}</CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">School Admins</CardTitle><CardDescription>Admin users assigned through memberships and RBAC.</CardDescription></CardHeader>
                  <CardContent className="space-y-3">{admins.length === 0 ? <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">No school admins assigned yet.</div> : admins.map((admin) => <div key={admin.id} className="rounded-md border p-3"><div className="flex items-center justify-between gap-3"><div><div className="font-medium">{admin.name}</div><div className="text-xs text-muted-foreground">{admin.email}</div></div><div className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{admin.school}</div></div><div className="mt-2 text-xs text-muted-foreground">{admin.roles.join(", ")}</div></div>)}</CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
