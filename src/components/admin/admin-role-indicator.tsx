"use client";

import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_HIERARCHY } from "@auto/shared";
import type { RoleCode } from "@auto/shared";

const ROLE_LABELS: Record<RoleCode, string> = {
  visitor: "Visiteur",
  buyer: "Acheteur",
  seller: "Vendeur",
  moderator: "Moderateur",
  administrator: "Administrateur",
};

export function AdminRoleIndicator() {
  const { roles } = useAuth();

  const highestRole = roles.reduce<RoleCode>(
    (max, r) => ((ROLE_HIERARCHY[r] ?? 0) > (ROLE_HIERARCHY[max] ?? 0) ? r : max),
    roles[0] ?? "visitor",
  );
  const isAdmin = roles.includes("administrator");

  return (
    <div className="flex items-center gap-2" data-testid="admin-role-indicator">
      <Shield className="size-4 text-primary" />
      <Badge variant={isAdmin ? "default" : "secondary"} data-testid="admin-role-badge">
        {ROLE_LABELS[highestRole]}
      </Badge>
      {isAdmin && (
        <span className="text-xs text-muted-foreground" data-testid="super-role-label">
          Acces complet (FR54)
        </span>
      )}
    </div>
  );
}
