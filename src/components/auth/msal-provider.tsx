"use client";

import { useEffect } from "react";
import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { msalInstance, isAzureConfigured } from "@/lib/auth/msal-instance";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Dev-mode auth hydrator: sets the auth store with a mock admin user
 * so that useAuth(), RoleGuard, and Sidebar work without Azure AD B2C.
 */
function DevAuthHydrator({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setUser({ id: "dev-admin", email: "admin@localhost", name: "Admin (Dev)" }, ["administrator"]);
  }, [setUser]);

  return <>{children}</>;
}

/**
 * Auth provider that wraps children with MsalProvider.
 * In dev mode (no Azure AD B2C config), also hydrates the auth store
 * with a mock admin user for role-based access.
 */
export function MsalProvider({ children }: { children: React.ReactNode }) {
  const content = isAzureConfigured ? children : <DevAuthHydrator>{children}</DevAuthHydrator>;

  return <MsalReactProvider instance={msalInstance}>{content}</MsalReactProvider>;
}
