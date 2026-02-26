"use client";

import { useState, useEffect, useCallback } from "react";
import { MetricsSummary } from "@/components/moderation/metrics-summary";
import { ReportQueue } from "@/components/moderation/report-queue";
import { fetchReportMetrics } from "@/lib/api/moderation-api";
import type { IReportMetrics } from "@auto/shared";

const METRICS_REFRESH_INTERVAL = 30_000;

export default function ModeratorDashboardPage() {
  const [metrics, setMetrics] = useState<IReportMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadMetrics = useCallback(async () => {
    try {
      const data = await fetchReportMetrics();
      setMetrics(data);
    } catch {
      // Silently ignore metrics errors
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(() => {
      loadMetrics();
      setRefreshTrigger((n) => n + 1);
    }, METRICS_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadMetrics]);

  return (
    <div className="space-y-4 sm:space-y-6" data-testid="moderator-dashboard">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Moderation</h1>
        <p className="text-sm text-muted-foreground mt-1 sm:mt-2 sm:text-base">
          Gerez les signalements et moderez les contenus de la plateforme.
        </p>
      </div>

      <MetricsSummary metrics={metrics} loading={metricsLoading} />
      <ReportQueue refreshTrigger={refreshTrigger} />
    </div>
  );
}
