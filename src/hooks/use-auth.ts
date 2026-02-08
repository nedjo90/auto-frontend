import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { loginRedirect, logoutRedirect } from "@/lib/auth/auth-utils";
import type { RoleCode } from "@auto/shared";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const roles = useAuthStore((s) => s.roles);

  const login = useCallback(async () => {
    await loginRedirect();
  }, []);

  const logout = useCallback(async () => {
    await logoutRedirect();
  }, []);

  const hasRole = useCallback((role: RoleCode) => roles.includes(role), [roles]);

  return {
    user,
    isAuthenticated,
    roles,
    login,
    logout,
    hasRole,
  };
}
