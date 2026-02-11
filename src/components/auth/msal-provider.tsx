"use client";

import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { msalInstance, isAzureConfigured } from "@/lib/auth/msal-instance";
import { useAuthStore } from "@/stores/auth-store";

// Synchronously hydrate auth store in dev mode BEFORE any component renders.
// This ensures RoleGuard, Sidebar, and useAuth() see the admin user on first render.
if (!isAzureConfigured) {
  useAuthStore
    .getState()
    .setUser({ id: "dev-admin", email: "admin@localhost", name: "Admin (Dev)" }, ["administrator"]);
}

/**
 * Auth provider that wraps children with MsalProvider.
 * In dev mode (no Azure AD B2C config), the auth store is pre-hydrated
 * with a mock admin user (see module-level init above).
 */
export function MsalProvider({ children }: { children: React.ReactNode }) {
  return <MsalReactProvider instance={msalInstance}>{children}</MsalReactProvider>;
}
