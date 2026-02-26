"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  User,
  MessageSquare,
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Shield,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { fetchReportDetail, assignReport } from "@/lib/api/moderation-api";
import { ModerationActions } from "./moderation-actions";
import type { IReportDetail } from "@auto/shared";

interface ReportDetailProps {
  reportId: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  in_progress: "En cours",
  treated: "Traite",
  dismissed: "Rejete",
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  listing: "Annonce",
  user: "Utilisateur",
  chat: "Conversation",
};

const TARGET_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  listing: FileText,
  user: User,
  chat: MessageSquare,
};

export function ReportDetail({ reportId }: ReportDetailProps) {
  const [detail, setDetail] = useState<IReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDetail(isInitial = false) {
    setLoading(isInitial);
    setError(null);
    try {
      const data = await fetchReportDetail(reportId);
      setDetail(data);

      // Auto-assign if pending
      if (data.status === "pending") {
        assignReport(reportId).catch(() => {});
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReportDetail(reportId);
        if (cancelled) return;
        setDetail(data);

        // Auto-assign if pending
        if (data.status === "pending") {
          assignReport(reportId).catch(() => {});
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  if (loading) {
    return (
      <div className="space-y-4" data-testid="detail-skeleton">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12" data-testid="detail-error">
        <AlertTriangle className="size-8 mx-auto text-destructive mb-2" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/moderator">Retour a la file</Link>
        </Button>
      </div>
    );
  }

  if (!detail) return null;

  const TargetIcon = TARGET_TYPE_ICONS[detail.targetType] || FileText;
  let targetData: Record<string, unknown> | null = null;
  if (detail.targetData) {
    try {
      targetData = JSON.parse(detail.targetData);
    } catch {
      targetData = null;
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="report-detail">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/moderator" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="size-4" />
          Moderation
        </Link>
        <span>/</span>
        <span>Rapport #{detail.ID.slice(0, 8)}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <TargetIcon className="size-6 text-muted-foreground" />
          <h1 className="text-lg font-bold sm:text-xl">
            {TARGET_TYPE_LABELS[detail.targetType]} - Rapport
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={SEVERITY_STYLES[detail.severity] || ""}>
            {detail.severity}
          </Badge>
          <Badge variant="outline">{STATUS_LABELS[detail.status] || detail.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Report info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informations du signalement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3" data-testid="report-info">
            <div>
              <span className="text-xs text-muted-foreground">Raison</span>
              <p className="text-sm font-medium">{detail.reasonLabel}</p>
            </div>
            <Separator />
            <div>
              <span className="text-xs text-muted-foreground">Description</span>
              <p className="text-sm whitespace-pre-wrap">{detail.description}</p>
            </div>
            <Separator />
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">Signale par</span>
                <p className="font-medium">{detail.reporterName || "Anonyme"}</p>
                {detail.reporterEmail && (
                  <p className="text-xs text-muted-foreground">{detail.reporterEmail}</p>
                )}
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Date</span>
                <p className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {new Date(detail.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            {detail.relatedReportsCount > 0 && (
              <>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 rounded px-3 py-2">
                  <AlertTriangle className="size-4" />
                  <span>
                    {detail.relatedReportsCount} autre{detail.relatedReportsCount > 1 ? "s" : ""}{" "}
                    signalement{detail.relatedReportsCount > 1 ? "s" : ""} sur cette cible
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Target data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TargetIcon className="size-4" />
              {TARGET_TYPE_LABELS[detail.targetType]} cible
            </CardTitle>
          </CardHeader>
          <CardContent data-testid="target-data">
            {targetData ? (
              <div className="space-y-2 text-sm">
                {detail.targetType === "listing" && (
                  <>
                    {targetData.make && (
                      <div>
                        <span className="text-xs text-muted-foreground">Vehicule</span>
                        <p className="font-medium">
                          {[targetData.make, targetData.model, targetData.variant]
                            .filter(Boolean)
                            .join(" ")}
                        </p>
                      </div>
                    )}
                    {targetData.year && (
                      <div>
                        <span className="text-xs text-muted-foreground">Annee</span>
                        <p>{targetData.year}</p>
                      </div>
                    )}
                    {targetData.price != null && (
                      <div>
                        <span className="text-xs text-muted-foreground">Prix</span>
                        <p className="font-medium">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                            maximumFractionDigits: 0,
                          }).format(targetData.price)}
                        </p>
                      </div>
                    )}
                    {targetData.status && (
                      <div>
                        <span className="text-xs text-muted-foreground">Statut annonce</span>
                        <p>{targetData.status}</p>
                      </div>
                    )}
                  </>
                )}
                {detail.targetType === "user" && (
                  <>
                    <div>
                      <span className="text-xs text-muted-foreground">Nom</span>
                      <p className="font-medium">
                        {[targetData.firstName, targetData.lastName].filter(Boolean).join(" ")}
                      </p>
                    </div>
                    {targetData.email && (
                      <div>
                        <span className="text-xs text-muted-foreground">Email</span>
                        <p>{targetData.email}</p>
                      </div>
                    )}
                    {targetData.createdAt && (
                      <div>
                        <span className="text-xs text-muted-foreground">Membre depuis</span>
                        <p>
                          {new Date(targetData.createdAt).toLocaleDateString("fr-FR", {
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </>
                )}
                {detail.targetType === "chat" && (
                  <div>
                    <span className="text-xs text-muted-foreground">Conversation</span>
                    <p>ID: {detail.targetId.slice(0, 8)}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Donnees de la cible non disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seller history link */}
      {(detail.targetType === "user" ||
        (detail.targetType === "listing" && targetData?.sellerId)) && (
        <Button variant="outline" asChild data-testid="seller-history-link">
          <Link
            href={`/moderator/sellers/${detail.targetType === "user" ? detail.targetId : targetData?.sellerId}?from=${detail.ID}`}
          >
            <History className="size-4 mr-1" />
            Voir l&apos;historique vendeur
          </Link>
        </Button>
      )}

      {/* Moderation actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4" />
            Actions de moderation
          </CardTitle>
        </CardHeader>
        <CardContent data-testid="action-buttons">
          <ModerationActions detail={detail} onActionComplete={() => loadDetail()} />
        </CardContent>
      </Card>
    </div>
  );
}
