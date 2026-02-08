"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function ModeratorLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard requiredRole="moderator">{children}</RoleGuard>;
}
