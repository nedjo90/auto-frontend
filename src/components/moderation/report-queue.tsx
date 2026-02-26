"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportCard } from "./report-card";
import { fetchReportQueue, type ReportQueueFilters } from "@/lib/api/moderation-api";
import type { IReport, ReportSortOption, ReportStatus, ReportTargetType } from "@auto/shared";
import { REPORTS_PAGE_SIZE } from "@auto/shared";

interface ReportQueueProps {
  refreshTrigger?: number;
}

export function ReportQueue({ refreshTrigger }: ReportQueueProps) {
  const [reports, setReports] = useState<IReport[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<ReportSortOption>("severity");

  const loadReports = useCallback(
    async (skip = 0, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filters: ReportQueueFilters = {
        sortBy,
        skip,
        top: REPORTS_PAGE_SIZE,
      };
      if (statusFilter !== "all") filters.status = statusFilter as ReportStatus;
      if (targetTypeFilter !== "all") filters.targetType = targetTypeFilter as ReportTargetType;
      if (severityFilter !== "all") filters.severity = severityFilter;

      try {
        const result = await fetchReportQueue(filters);
        if (append) {
          setReports((prev) => [...prev, ...result.items]);
        } else {
          setReports(result.items);
        }
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [statusFilter, targetTypeFilter, severityFilter, sortBy],
  );

  // Reload when filters change or refresh trigger fires
  useEffect(() => {
    loadReports(0, false);
  }, [loadReports, refreshTrigger]);

  return (
    <div className="space-y-4" data-testid="report-queue">
      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 sm:gap-3" data-testid="queue-filters">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] sm:w-[160px]" data-testid="filter-status">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="treated">Traites</SelectItem>
            <SelectItem value="dismissed">Rejetes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
          <SelectTrigger className="w-[140px] sm:w-[160px]" data-testid="filter-target-type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="listing">Annonces</SelectItem>
            <SelectItem value="user">Utilisateurs</SelectItem>
            <SelectItem value="chat">Conversations</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px] sm:w-[160px]" data-testid="filter-severity">
            <SelectValue placeholder="Severite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes severites</SelectItem>
            <SelectItem value="critical">Critique</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="low">Basse</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as ReportSortOption)}>
          <SelectTrigger className="w-[140px] sm:w-[160px]" data-testid="sort-select">
            <SelectValue placeholder="Tri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="severity">Severite</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="status">Statut</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Total count */}
      {!loading && (
        <p className="text-sm text-muted-foreground" data-testid="queue-total">
          {total} signalement{total !== 1 ? "s" : ""}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3" data-testid="queue-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive" data-testid="queue-error">
          {error}
        </p>
      )}

      {/* Report list */}
      {!loading && !error && (
        <div className="space-y-2 sm:space-y-3">
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8" data-testid="queue-empty">
              Aucun signalement ne correspond aux filtres.
            </p>
          ) : (
            reports.map((report) => <ReportCard key={report.ID} report={report} />)
          )}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => loadReports(reports.length, true)}
            disabled={loadingMore}
            data-testid="load-more"
          >
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              "Charger plus"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
