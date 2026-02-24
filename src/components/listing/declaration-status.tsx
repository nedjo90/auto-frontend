"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDeclarationSummary, type DeclarationSummary } from "@/lib/api/declaration-api";

export interface DeclarationStatusProps {
  listingId: string;
  /** "seller" shows CTA to declare, "admin" shows full details */
  viewMode: "seller" | "admin";
  /** Full declaration data (admin only) */
  adminData?: {
    checkboxStates: Array<{ label: string; checked: boolean }>;
    ipAddress: string;
    declarationVersion: string;
    signedAt: string;
  };
  onDeclare?: () => void;
}

export function DeclarationStatus({
  listingId,
  viewMode,
  adminData,
  onDeclare,
}: DeclarationStatusProps) {
  const [summary, setSummary] = useState<DeclarationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDeclarationSummary(listingId)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  if (isLoading) {
    return (
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground"
        data-testid="declaration-status-loading"
      >
        <Loader2 className="size-4 animate-spin" />
        Chargement...
      </div>
    );
  }

  // Admin view with full details
  if (viewMode === "admin" && adminData) {
    const date = new Date(adminData.signedAt);
    return (
      <div className="space-y-3 rounded-md border p-4" data-testid="declaration-admin-view">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-green-600" />
          <span className="font-medium">Déclaration sur l&apos;honneur</span>
        </div>
        <div className="text-sm space-y-1">
          <p data-testid="admin-declaration-date">
            Signée le {date.toLocaleDateString("fr-FR")} à{" "}
            {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p data-testid="admin-declaration-version">Version: {adminData.declarationVersion}</p>
          <p data-testid="admin-declaration-ip">IP: {adminData.ipAddress}</p>
        </div>
        <div className="space-y-1" data-testid="admin-declaration-checkboxes">
          <p className="text-xs font-medium text-muted-foreground">Attestations:</p>
          {adminData.checkboxStates.map((cb, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className={cb.checked ? "text-green-600" : "text-destructive"}>
                {cb.checked ? "✓" : "✗"}
              </span>
              <span>{cb.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Seller view: summary
  if (summary?.hasDeclared && summary.signedAt) {
    const date = new Date(summary.signedAt);
    const formatted = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="flex items-center gap-2" data-testid="declaration-status-declared">
        <ShieldCheck className="size-5 text-green-600" />
        <span className="text-sm">Déclaration signée le {formatted}</span>
      </div>
    );
  }

  // Not declared
  return (
    <div className="flex items-center gap-3" data-testid="declaration-status-required">
      <ShieldAlert className="size-5 text-yellow-500" />
      <span className="text-sm">Déclaration requise avant publication</span>
      {onDeclare && (
        <Button size="sm" variant="outline" onClick={onDeclare} data-testid="declaration-cta-btn">
          Déclarer
        </Button>
      )}
    </div>
  );
}
