import React from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/domains/auth/AuthProvider";

export type Membership = {
  id: string;
  organization_id: string;
  school_id: string | null;
  campus_id: string | null;
  status: string;
  organization: { id: string; name: string; slug: string; org_code: string } | null;
  school: { id: string; name: string; slug: string; school_code: string } | null;
  campus: { id: string; name: string; slug: string; campus_code: string } | null;
  membership_roles?: Array<{ role: { key: string; name: string } | null }>;
};

type TenantContextValue = {
  loading: boolean;
  isPlatformAdmin: boolean;
  memberships: Membership[];
  selectedMembership: Membership | null;
  selectMembership: (membershipId: string) => void;
  refreshTenant: () => Promise<void>;
};

const TenantContext = React.createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [isPlatformAdmin, setIsPlatformAdmin] = React.useState(false);
  const [memberships, setMemberships] = React.useState<Membership[]>([]);
  const [selectedMembershipId, setSelectedMembershipId] = React.useState<string | null>(null);

  const loadTenant = React.useCallback(async () => {
    if (!user) {
      setIsPlatformAdmin(false);
      setMemberships([]);
      setSelectedMembershipId(null);
      return;
    }

    setLoading(true);

    const [{ data: platformAdmin }, { data: membershipRows, error }] = await Promise.all([
      supabase.from("platform_admins").select("profile_id,status").eq("profile_id", user.id).eq("status", "active").maybeSingle(),
      supabase
        .from("memberships")
        .select(`
          id,
          organization_id,
          school_id,
          campus_id,
          status,
          organization:organizations(id,name,slug,org_code),
          school:schools(id,name,slug,school_code),
          campus:campuses(id,name,slug,campus_code),
          membership_roles(role:roles!membership_roles_role_id_fkey(key,name))
        `)
        .eq("profile_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: true }),
    ]);

    if (error) {
      console.error(error);
      setMemberships([]);
    } else {
      const normalized = (membershipRows ?? []) as unknown as Membership[];
      setMemberships(normalized);
      setSelectedMembershipId((current) => {
        if (current && normalized.some((membership) => membership.id === current)) return current;
        return normalized[0]?.id ?? null;
      });
    }

    setIsPlatformAdmin(Boolean(platformAdmin));
    setLoading(false);
  }, [user]);

  React.useEffect(() => {
    loadTenant();
  }, [loadTenant]);

  const selectedMembership = React.useMemo(
    () => memberships.find((membership) => membership.id === selectedMembershipId) ?? null,
    [memberships, selectedMembershipId]
  );

  return (
    <TenantContext.Provider
      value={{
        loading,
        isPlatformAdmin,
        memberships,
        selectedMembership,
        selectMembership: setSelectedMembershipId,
        refreshTenant: loadTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = React.useContext(TenantContext);
  if (!context) throw new Error("useTenant must be used within TenantProvider");
  return context;
}
