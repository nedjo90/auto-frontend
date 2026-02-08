"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { ConsentReviewDialog } from "@/components/auth/consent-review-dialog";
import { usePendingConsents } from "@/hooks/use-pending-consents";
import { useMsal } from "@azure/msal-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accounts } = useMsal();
  const userId = accounts[0]?.localAccountId ?? null;
  usePendingConsents(userId);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <ConsentReviewDialog />
    </div>
  );
}
