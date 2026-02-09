import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { loginRedirect, logoutRedirect } from "@/lib/auth/auth-utils";
import { expandRolesWithHierarchy } from "@auto/shared";
import type { RoleCode } from "@auto/shared";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const roles = useAuthStore((s) => s.roles);

  // FR54: Expand roles with hierarchy so admin gains all lower-level capabilities
  const expandedRoles = useMemo(() => expandRolesWithHierarchy(roles), [roles]);

  const login = useCallback(async () => {
    await loginRedirect();
  }, []);

  const logout = useCallback(async () => {
    await logoutRedirect();
  }, []);

  const hasRole = useCallback((role: RoleCode) => expandedRoles.includes(role), [expandedRoles]);

  return {
    user,
    isAuthenticated,
    roles: expandedRoles,
    login,
    logout,
    hasRole,
  };
}
