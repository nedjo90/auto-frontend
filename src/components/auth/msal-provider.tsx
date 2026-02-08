"use client";

import { MsalProvider as MsalReactProvider } from "@azure/msal-react";
import { msalInstance } from "@/lib/auth/msal-instance";

export function MsalProvider({ children }: { children: React.ReactNode }) {
  return (
    <MsalReactProvider instance={msalInstance}>{children}</MsalReactProvider>
  );
}
