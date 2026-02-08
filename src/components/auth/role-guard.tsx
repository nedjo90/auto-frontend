"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import type { RoleCode } from "@auto/shared";

interface RoleGuardProps {
  requiredRole: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Validates that a return URL is a safe relative path (no open redirect).
 */
function safeReturnUrl(pathname: string): string {
  if (pathname.startsWith("/") && !pathname.startsWith("//")) {
    return pathname;
  }
  return "/";
}

export function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { isAuthenticated, roles } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  const hasRequiredRole = requiredRoles.some((r) => roles.includes(r as RoleCode));

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(safeReturnUrl(pathname))}`);
    } else if (!hasRequiredRole) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, hasRequiredRole, router, pathname]);

  if (!isAuthenticated || !hasRequiredRole) {
    return (
      fallback ?? (
        <div className="flex items-center justify-center p-8" aria-busy="true">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  return <>{children}</>;
}
