import React from "react";
import { useTenant } from "@/domains/tenant/TenantProvider";

const rolePermissions: Record<string, string[]> = {
  organization_owner: ["*"],
  school_owner: ["*"],
  principal: ["academics.read", "academics.manage", "students.read", "students.manage", "guardians.read", "guardians.manage", "users.invite"],
  school_admin: ["academics.read", "academics.manage", "students.read", "students.manage", "guardians.read", "guardians.manage", "users.invite"],
  teacher: ["academics.read", "students.read", "guardians.read", "attendance.read", "attendance.manage", "homework.read", "homework.manage"],
  accountant: ["students.read", "guardians.read"],
  parent: [],
  student: [],
};

export function usePermissions() {
  const { selectedMembership } = useTenant();
  const roleKeys = React.useMemo(
    () => selectedMembership?.membership_roles?.map((item) => item.role?.key).filter((key): key is string => Boolean(key)) ?? [],
    [selectedMembership],
  );

  const permissions = React.useMemo(() => {
    const next = new Set<string>();
    roleKeys.forEach((roleKey) => {
      rolePermissions[roleKey]?.forEach((permission: string) => next.add(permission));
    });
    return next;
  }, [roleKeys]);

  const hasPermission = React.useCallback(
    (permission: string) => permissions.has("*") || permissions.has(permission),
    [permissions],
  );

  const hasAnyPermission = React.useCallback(
    (requiredPermissions: string[]) => requiredPermissions.length === 0 || requiredPermissions.some(hasPermission),
    [hasPermission],
  );

  return { roleKeys, permissions, hasPermission, hasAnyPermission };
}
