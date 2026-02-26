"use client";

import { useMemo, useState } from "react";
import { Ban, AlertTriangle, XCircle, RefreshCw, UserX, RotateCcw } from "lucide-react";
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
import {
  deactivateListing,
  sendWarning,
  deactivateAccount,
  reactivateListing,
  reactivateAccount,
  dismissReport,
} from "@/lib/api/moderation-api";
import type { IReportDetail } from "@auto/shared";

interface ModerationActionsProps {
  detail: IReportDetail;
  onActionComplete: () => void;
}

type ActionType =
  | "deactivate_listing"
  | "warning"
  | "deactivate_account"
  | "reactivate_listing"
  | "reactivate_account"
  | "dismiss"
  | null;

export function ModerationActions({ detail, onActionComplete }: ModerationActionsProps) {
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDeactivateAccount, setConfirmDeactivateAccount] = useState(false);

  const isClosed = detail.status === "treated" || detail.status === "dismissed";

  // Parse target data to extract status and seller info
  const targetInfo = useMemo(() => {
    if (!detail.targetData) return null;
    try {
      return JSON.parse(detail.targetData) as Record<string, unknown>;
    } catch {
      return null;
    }
  }, [detail.targetData]);

  const targetStatus = (targetInfo?.status as string) || null;
  const sellerId = (targetInfo?.sellerId as string) || null;
  const isTargetSuspended = targetStatus === "suspended";

  async function handleSubmit() {
    if (!activeAction) return;
    setSubmitting(true);
    setError(null);

    try {
      switch (activeAction) {
        case "deactivate_listing":
          await deactivateListing({
            reportId: detail.ID,
            listingId: detail.targetId,
            reason: reason || undefined,
          });
          break;
        case "warning":
          await sendWarning({
            reportId: detail.ID,
            userId: detail.targetType === "user" ? detail.targetId : sellerId || "",
            warningMessage: reason || undefined,
          });
          break;
        case "deactivate_account":
          await deactivateAccount({
            reportId: detail.ID,
            userId: detail.targetType === "user" ? detail.targetId : "",
            reason: reason || undefined,
            confirmed: true,
          });
          break;
        case "reactivate_listing":
          await reactivateListing({
            listingId: detail.targetId,
            reason: reason || undefined,
          });
          break;
        case "reactivate_account":
          await reactivateAccount({
            userId: detail.targetId,
            reason: reason || undefined,
          });
          break;
        case "dismiss":
          await dismissReport({
            reportId: detail.ID,
            reason: reason || undefined,
          });
          break;
      }
      setActiveAction(null);
      setReason("");
      setConfirmDeactivateAccount(false);
      onActionComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'action");
    } finally {
      setSubmitting(false);
    }
  }

  function openAction(action: ActionType) {
    setActiveAction(action);
    setReason("");
    setError(null);
    setConfirmDeactivateAccount(false);
  }

  const actionLabels: Record<string, { title: string; description: string; confirmLabel: string }> =
    {
      deactivate_listing: {
        title: "Suspendre l'annonce",
        description: "L'annonce sera suspendue et ne sera plus visible. Le vendeur sera notifie.",
        confirmLabel: "Suspendre",
      },
      warning: {
        title: "Envoyer un avertissement",
        description:
          "Un avertissement sera envoye a l'utilisateur. Le rapport sera marque comme traite.",
        confirmLabel: "Envoyer",
      },
      deactivate_account: {
        title: "Suspendre le compte",
        description:
          "Le compte sera suspendu et toutes ses annonces publiees seront suspendues. Cette action est reversible.",
        confirmLabel: "Confirmer la suspension",
      },
      reactivate_listing: {
        title: "Reactiver l'annonce",
        description: "L'annonce sera reactivee et redeviendra visible sur la plateforme.",
        confirmLabel: "Reactiver",
      },
      reactivate_account: {
        title: "Reactiver le compte",
        description:
          "Le compte sera reactive. Les annonces suspendues devront etre reactivees individuellement.",
        confirmLabel: "Reactiver",
      },
      dismiss: {
        title: "Rejeter le signalement",
        description: "Le signalement sera rejete. Aucune action ne sera prise sur la cible.",
        confirmLabel: "Rejeter",
      },
    };

  const current = activeAction ? actionLabels[activeAction] : null;

  return (
    <>
      <div className="flex flex-wrap gap-2" data-testid="moderation-actions">
        {isClosed ? (
          <p className="text-sm text-muted-foreground">
            Ce rapport a ete {detail.status === "treated" ? "traite" : "rejete"}.
          </p>
        ) : (
          <>
            {detail.targetType === "listing" && !isTargetSuspended && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openAction("deactivate_listing")}
                data-testid="action-deactivate-listing"
              >
                <Ban className="size-4 mr-1" />
                Suspendre l&apos;annonce
              </Button>
            )}
            {detail.targetType === "listing" && isTargetSuspended && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAction("reactivate_listing")}
                data-testid="action-reactivate-listing"
              >
                <RotateCcw className="size-4 mr-1" />
                Reactiver l&apos;annonce
              </Button>
            )}
            {detail.targetType === "user" && !isTargetSuspended && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openAction("deactivate_account")}
                data-testid="action-deactivate-account"
              >
                <UserX className="size-4 mr-1" />
                Suspendre le compte
              </Button>
            )}
            {detail.targetType === "user" && isTargetSuspended && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAction("reactivate_account")}
                data-testid="action-reactivate-account"
              >
                <RotateCcw className="size-4 mr-1" />
                Reactiver le compte
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAction("warning")}
              data-testid="action-warning"
            >
              <AlertTriangle className="size-4 mr-1" />
              Avertissement
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAction("dismiss")}
              data-testid="action-dismiss"
            >
              <XCircle className="size-4 mr-1" />
              Rejeter
            </Button>
          </>
        )}
      </div>

      {/* Confirmation dialog */}
      <ResponsiveDialog
        open={activeAction !== null}
        onOpenChange={(o) => !o && setActiveAction(null)}
      >
        <ResponsiveDialogContent data-testid="action-dialog">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>{current?.title}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>{current?.description}</ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="space-y-3 py-2">
            <Textarea
              placeholder="Raison (optionnelle)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              data-testid="action-reason"
            />

            {activeAction === "deactivate_account" && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={confirmDeactivateAccount}
                  onChange={(e) => setConfirmDeactivateAccount(e.target.checked)}
                  data-testid="confirm-checkbox"
                />
                Je confirme vouloir suspendre ce compte
              </label>
            )}

            {error && (
              <p className="text-sm text-destructive" data-testid="action-error">
                {error}
              </p>
            )}
          </div>

          <ResponsiveDialogFooter>
            <Button variant="outline" onClick={() => setActiveAction(null)} disabled={submitting}>
              Annuler
            </Button>
            <Button
              variant={
                activeAction === "dismiss" ||
                activeAction === "reactivate_listing" ||
                activeAction === "reactivate_account"
                  ? "outline"
                  : "destructive"
              }
              onClick={handleSubmit}
              disabled={
                submitting || (activeAction === "deactivate_account" && !confirmDeactivateAccount)
              }
              data-testid="action-confirm"
            >
              {submitting ? <RefreshCw className="size-4 animate-spin mr-1" /> : null}
              {current?.confirmLabel}
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
