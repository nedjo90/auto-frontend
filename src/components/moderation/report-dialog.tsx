"use client";

import { useState, useEffect } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { fetchReportReasons, submitReport } from "@/lib/api/moderation-api";
import type { IConfigReportReason, ReportTargetType } from "@auto/shared";
import { REPORT_DESCRIPTION_MIN_LENGTH, REPORT_DESCRIPTION_MAX_LENGTH } from "@auto/shared";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: ReportTargetType;
  targetId: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export function ReportDialog({ open, onOpenChange, targetType, targetId }: ReportDialogProps) {
  const [reasons, setReasons] = useState<IConfigReportReason[]>([]);
  const [reasonId, setReasonId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      fetchReportReasons()
        .then(setReasons)
        .catch(() => setReasons([]));
      // Reset form state
      setReasonId("");
      setDescription("");
      setError(null);
      setSuccess(false);
    }
  }, [open]);

  const selectedReason = reasons.find((r) => r.ID === reasonId);
  const descriptionTooShort =
    description.trim().length > 0 && description.trim().length < REPORT_DESCRIPTION_MIN_LENGTH;
  const canSubmit =
    reasonId && description.trim().length >= REPORT_DESCRIPTION_MIN_LENGTH && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      await submitReport({ targetType, targetId, reasonId, description: description.trim() });
      setSuccess(true);
      setTimeout(() => onOpenChange(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du signalement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent data-testid="report-dialog">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Signaler un contenu
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Aidez-nous à maintenir la qualité de la plateforme en signalant les contenus
            inappropriés.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        {success ? (
          <div className="py-6 text-center" data-testid="report-success">
            <p className="text-sm font-medium text-green-600">Votre signalement a été enregistré</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Reason select */}
            <div className="space-y-2">
              <Label htmlFor="report-reason">Raison du signalement</Label>
              <Select value={reasonId} onValueChange={setReasonId}>
                <SelectTrigger id="report-reason" data-testid="report-reason-select">
                  <SelectValue placeholder="Sélectionnez une raison" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((r) => (
                    <SelectItem key={r.ID} value={r.ID}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity indicator */}
            {selectedReason && (
              <div className="flex items-center gap-2" data-testid="report-severity">
                <span className="text-sm text-muted-foreground">Sévérité :</span>
                <Badge className={SEVERITY_COLORS[selectedReason.severity] || ""} variant="outline">
                  {selectedReason.severity}
                </Badge>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                data-testid="report-description"
                placeholder="Décrivez le problème en détail (minimum 20 caractères)..."
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value.slice(0, REPORT_DESCRIPTION_MAX_LENGTH))
                }
                rows={4}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                {descriptionTooShort && (
                  <span className="text-destructive" data-testid="description-error">
                    Minimum {REPORT_DESCRIPTION_MIN_LENGTH} caractères
                  </span>
                )}
                <span className="ml-auto">
                  {description.length}/{REPORT_DESCRIPTION_MAX_LENGTH}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive" data-testid="report-error">
                {error}
              </p>
            )}
          </div>
        )}

        <ResponsiveDialogFooter>
          {!success && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit} data-testid="report-submit">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  "Envoyer le signalement"
                )}
              </Button>
            </>
          )}
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
