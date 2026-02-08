"use client";

import { RoleGuard } from "@/components/auth/role-guard";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard requiredRole="seller">{children}</RoleGuard>;
}
