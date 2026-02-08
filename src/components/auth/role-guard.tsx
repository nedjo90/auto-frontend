"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@auto/shared";

interface RoleGuardProps {
  requiredRole: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { isAuthenticated, roles } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  const hasRequiredRole = requiredRoles.some((r) => roles.includes(r as Role));

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    } else if (!hasRequiredRole) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, hasRequiredRole, router, pathname]);

  if (!isAuthenticated || !hasRequiredRole) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
