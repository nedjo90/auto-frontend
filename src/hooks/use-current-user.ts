"use client";

import { useMsal } from "@azure/msal-react";
import { useAuthStore } from "@/stores/auth-store";
import { isAzureConfigured } from "@/lib/auth/msal-instance";

interface CurrentUser {
  isAuthenticated: boolean;
  userId: string | null;
  displayName: string | null;
  email: string | null;
}

/**
 * Returns current user info from the appropriate source:
 * - Dev mode: reads from Zustand authStore (pre-hydrated with admin user)
 * - Prod mode: reads from MSAL accounts
 *
 * Use this instead of useMsal() directly in components that display user info.
 */
export function useCurrentUser(): CurrentUser {
  // isAzureConfigured is a module-level constant — this branch is determined at build time.
  if (!isAzureConfigured) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const user = useAuthStore((s) => s.user);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const isAuth = useAuthStore((s) => s.isAuthenticated);
    return {
      isAuthenticated: isAuth,
      userId: user?.id ?? null,
      displayName: user?.name ?? null,
      email: user?.email ?? null,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { accounts } = useMsal();
  const account = accounts[0];
  return {
    isAuthenticated: !!account,
    userId: account?.localAccountId ?? null,
    displayName: account?.name ?? null,
    email: account?.username ?? null,
  };
}
