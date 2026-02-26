"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, Info, UserX, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { deactivateAccount } from "@/lib/api/moderation-api";
import type { IViolationPattern } from "@auto/shared";

interface PatternAlertProps {
  patterns: IViolationPattern[];
  sellerId: string;
  onActionComplete: () => void;
}

const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-orange-50 border-orange-200 text-orange-800",
  critical: "bg-red-50 border-red-200 text-red-800",
};

const SEVERITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
};

export function PatternAlert({ patterns, sellerId, onActionComplete }: PatternAlertProps) {
  const [showEscalation, setShowEscalation] = useState(false);
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (patterns.length === 0) return null;

  const hasCritical = patterns.some((p) => p.severity === "critical");

  async function handleEscalation() {
    setSubmitting(true);
    setError(null);
    try {
      await deactivateAccount({
        userId: sellerId,
        reason: reason || undefined,
        confirmed: true,
      });
      setShowEscalation(false);
      setReason("");
      setConfirmed(false);
      onActionComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suspension");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="space-y-2" data-testid="pattern-alerts">
        {patterns.map((pattern, idx) => {
          const Icon = SEVERITY_ICONS[pattern.severity] || AlertTriangle;
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-lg border p-3 ${SEVERITY_STYLES[pattern.severity] || ""}`}
              data-testid={`pattern-${pattern.type}`}
            >
              <Icon className="size-5 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{pattern.description}</p>
                {pattern.period && <p className="text-xs opacity-75">Periode: {pattern.period}</p>}
              </div>
            </div>
          );
        })}

        {hasCritical && (
          <div
            className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3"
            data-testid="escalation-prompt"
          >
            <p className="text-sm text-red-800 font-medium mb-2">
              Ce vendeur presente un historique problematique. Envisagez la desactivation du compte.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowEscalation(true)}
              data-testid="escalation-button"
            >
              <UserX className="size-4 mr-1" />
              Suspendre le compte
            </Button>
          </div>
        )}
      </div>

      <ResponsiveDialog open={showEscalation} onOpenChange={(o) => !o && setShowEscalation(false)}>
        <ResponsiveDialogContent data-testid="escalation-dialog">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Suspendre le compte</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Le compte sera suspendu et toutes ses annonces publiees seront suspendues. Cette
              action est reversible.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-3 py-2">
            <Textarea
              placeholder="Raison (optionnelle)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              data-testid="escalation-reason"
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                data-testid="escalation-confirm-checkbox"
              />
              Je confirme vouloir suspendre ce compte
            </label>

            {error && (
              <p className="text-sm text-destructive" data-testid="escalation-error">
                {error}
              </p>
            )}
          </div>

          <ResponsiveDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEscalation(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleEscalation}
              disabled={submitting || !confirmed}
              data-testid="escalation-submit"
            >
              {submitting ? <RefreshCw className="size-4 animate-spin mr-1" /> : null}
              Confirmer la suspension
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
