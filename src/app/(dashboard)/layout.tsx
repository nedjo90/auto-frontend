"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ConsentReviewDialog } from "@/components/auth/consent-review-dialog";
import { SessionTimeoutWarning } from "@/components/auth/session-timeout-warning";
import { usePendingConsents } from "@/hooks/use-pending-consents";
import { useInactivityTimeout } from "@/hooks/use-inactivity-timeout";
import { useMsal } from "@azure/msal-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { accounts } = useMsal();
  const userId = accounts[0]?.localAccountId ?? null;
  usePendingConsents(userId);
  const { showWarning, remainingSeconds, timeoutMinutes, warningMinutes } = useInactivityTimeout(
    30,
    5,
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <ConsentReviewDialog />
      <SessionTimeoutWarning
        showWarning={showWarning}
        remainingSeconds={remainingSeconds}
        timeoutMinutes={timeoutMinutes}
        warningMinutes={warningMinutes}
      />
    </div>
  );
}
