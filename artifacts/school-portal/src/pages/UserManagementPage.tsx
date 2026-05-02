import React from "react";
import { Mail, RefreshCw, ShieldCheck, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/domains/tenant/TenantProvider";
import { supabase } from "@/lib/supabase/client";

type UserRow = {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
};

export function UserManagementPage() {
  const { selectedMembership } = useTenant();
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("teacher");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    if (!selectedMembership?.organization_id || !selectedMembership.school_id) return;

    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("memberships")
      .select("id,status,profile:profiles!memberships_profile_id_fkey(email,full_name),membership_roles(role:roles!membership_roles_role_id_fkey(key,name))")
      .eq("organization_id", selectedMembership.organization_id)
      .eq("school_id", selectedMembership.school_id)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setUsers([]);
    } else {
      const normalized = ((data ?? []) as any[]).map((membership) => ({
        id: membership.id,
        email: membership.profile?.email ?? "No email",
        name: membership.profile?.full_name ?? "Unnamed user",
        status: membership.status,
        roles: (membership.membership_roles ?? []).map((item: any) => item.role?.name).filter(Boolean),
      }));
      setUsers(normalized);
      setError(null);
    }
    setLoading(false);
  }, [selectedMembership]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const assignUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMembership?.organization_id || !selectedMembership.school_id) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const { error: rpcError } = await supabase.rpc("assign_school_user_by_email", {
      org_id: selectedMembership.organization_id,
      sch_id: selectedMembership.school_id,
      user_email: email.trim().toLowerCase(),
      role_key: role,
    });

    if (rpcError) {
      setError(
        rpcError.message.includes("No signed-up profile")
          ? "That email must sign up once before you can assign a school role. Email invitations are the next automation step."
          : rpcError.message,
      );
    } else {
      setSuccess(`${email.trim()} assigned as ${role}.`);
      setEmail("");
      await loadUsers();
    }

    setSaving(false);
  };

  return (
    <div>
      <PageHeader title="User Management" description="Assign existing signed-up users to this school through memberships and RBAC." />

      {error && <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Assign User
            </CardTitle>
            <CardDescription>For now the user must already have a profile. Proper email invites come next.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={assignUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teacher@school.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select id="role" value={role} onChange={(event) => setRole(event.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="teacher">Teacher</option>
                  <option value="accountant">Accountant</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
              <Button type="submit" disabled={saving}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {saving ? "Assigning..." : "Assign role"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>School Users</CardTitle>
              <CardDescription>Active users in the selected school.</CardDescription>
            </div>
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Roles</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No users assigned yet.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{user.name}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-4 py-3">{user.roles.join(", ") || "No role"}</td>
                        <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
