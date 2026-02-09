"use client";

import { RoleGuard } from "@/components/auth/role-guard";
import { AdminRoleIndicator } from "@/components/admin/admin-role-indicator";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard requiredRole="administrator">
      <div className="space-y-4">
        <div className="flex items-center justify-end" data-testid="admin-header-bar">
          <AdminRoleIndicator />
        </div>
        {children}
      </div>
    </RoleGuard>
  );
}
