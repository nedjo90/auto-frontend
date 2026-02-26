"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  FileText,
  User,
  Shield,
  Ban,
  RotateCcw,
  XCircle,
  Calendar,
  BarChart3,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSellerHistory } from "@/lib/api/moderation-api";
import { PatternAlert } from "./pattern-alert";
import type { ISellerHistory, ISellerTimelineEvent, ModerationActionType } from "@auto/shared";

interface SellerHistoryProps {
  sellerId: string;
  fromReportId?: string;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: "Actif", className: "bg-green-100 text-green-800 border-green-200" },
  suspended: { label: "Suspendu", className: "bg-red-100 text-red-800 border-red-200" },
  anonymized: { label: "Anonymise", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  report: AlertTriangle,
  deactivate_listing: Ban,
  deactivate_account: Ban,
  warning: AlertTriangle,
  reactivate_listing: RotateCcw,
  reactivate_account: RotateCcw,
  dismiss: XCircle,
};

const EVENT_COLORS: Record<string, string> = {
  report: "border-yellow-400 bg-yellow-50",
  deactivate_listing: "border-red-400 bg-red-50",
  deactivate_account: "border-red-400 bg-red-50",
  warning: "border-orange-400 bg-orange-50",
  reactivate_listing: "border-green-400 bg-green-50",
  reactivate_account: "border-green-400 bg-green-50",
  dismiss: "border-gray-400 bg-gray-50",
};

export function SellerHistory({ sellerId, fromReportId }: SellerHistoryProps) {
  const [data, setData] = useState<ISellerHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const history = await fetchSellerHistory(sellerId);
      if (!mountedRef.current) return;
      setData(history);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    mountedRef.current = true;
    loadHistory();
    return () => {
      mountedRef.current = false;
    };
  }, [loadHistory]);

  if (loading) {
    return (
      <div className="space-y-4" data-testid="seller-history-skeleton">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12" data-testid="seller-history-error">
        <AlertTriangle className="size-8 mx-auto text-destructive mb-2" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => loadHistory()}>
          Reessayer
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const statusInfo = STATUS_BADGE[data.accountStatus] || STATUS_BADGE.active;

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="seller-history">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/moderator" className="hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="size-4" />
          Moderation
        </Link>
        <span>/</span>
        {fromReportId && (
          <>
            <Link href={`/moderator/reports/${fromReportId}`} className="hover:text-foreground">
              Rapport #{fromReportId.slice(0, 8)}
            </Link>
            <span>/</span>
          </>
        )}
        <span>Historique vendeur</span>
      </div>

      {/* Seller profile summary */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-lg font-bold">
            {data.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold sm:text-xl" data-testid="seller-name">
              {data.displayName}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" />
              Membre depuis{" "}
              {new Date(data.memberSince).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </p>
            {data.sellerRating != null && (
              <p
                className="text-sm text-muted-foreground flex items-center gap-1"
                data-testid="seller-rating"
              >
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                {data.sellerRating.toFixed(1)} / 5
              </p>
            )}
          </div>
        </div>
        <Badge variant="outline" className={statusInfo.className} data-testid="account-status">
          {statusInfo.label}
        </Badge>
      </div>

      {/* Pattern alerts */}
      {data.patterns.length > 0 && (
        <PatternAlert
          patterns={data.patterns}
          sellerId={sellerId}
          onActionComplete={() => loadHistory()}
        />
      )}

      {/* Statistics cards */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 lg:grid-cols-3" data-testid="statistics">
        <StatCard label="Annonces publiees" value={data.statistics.totalListings} icon={FileText} />
        <StatCard label="Annonces actives" value={data.statistics.activeListings} icon={FileText} />
        <StatCard
          label="Signalements"
          value={data.statistics.reportsReceived}
          icon={AlertTriangle}
          highlight={data.statistics.reportsReceived > 0}
        />
        <StatCard
          label="Avertissements"
          value={data.statistics.warningsReceived}
          icon={Shield}
          highlight={data.statistics.warningsReceived > 0}
        />
        <StatCard
          label="Suspensions"
          value={data.statistics.suspensions}
          icon={Ban}
          highlight={data.statistics.suspensions > 0}
        />
        <StatCard
          label="Taux certification"
          value={`${data.statistics.certificationRate}%`}
          icon={BarChart3}
        />
      </div>

      {/* Moderation timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="size-4" />
            Historique de moderation
          </CardTitle>
        </CardHeader>
        <CardContent data-testid="timeline">
          {data.timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucun evenement de moderation
            </p>
          ) : (
            <div className="space-y-0">
              {data.timeline.map((event, idx) => (
                <TimelineEvent
                  key={event.id}
                  event={event}
                  isLast={idx === data.timeline.length - 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-orange-200" : ""}>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center justify-between">
          <Icon className={`size-4 ${highlight ? "text-orange-500" : "text-muted-foreground"}`} />
        </div>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function TimelineEvent({ event, isLast }: { event: ISellerTimelineEvent; isLast: boolean }) {
  const Icon = EVENT_ICONS[event.eventType] || AlertTriangle;
  const colorClass = EVENT_COLORS[event.eventType] || "border-gray-400 bg-gray-50";

  return (
    <div className="flex gap-3" data-testid="timeline-event">
      <div className="flex flex-col items-center">
        <div
          className={`flex size-8 items-center justify-center rounded-full border-2 ${colorClass}`}
        >
          <Icon className="size-3.5" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border my-1" />}
      </div>
      <div className={`pb-4 flex-1 min-w-0 ${isLast ? "" : ""}`}>
        <p className="text-sm font-medium">{event.description}</p>
        {event.outcome && (
          <p className="text-xs text-muted-foreground">Resultat: {event.outcome}</p>
        )}
        {event.reason && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.reason}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(event.date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
