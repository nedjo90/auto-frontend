"use client";

import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
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

  const highestRole = roles[roles.length - 1] ?? "visitor";
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
