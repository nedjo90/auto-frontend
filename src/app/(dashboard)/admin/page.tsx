"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Wifi, WifiOff } from "lucide-react";
import { KpiCard } from "@/components/admin/kpi-card";
import { KpiCardSkeleton } from "@/components/admin/kpi-card-skeleton";
import { TrendChart } from "@/components/admin/trend-chart";
import { AlertBanner } from "@/components/admin/alert-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDashboardKpis, fetchDashboardTrend } from "@/lib/api/dashboard-api";
import { useLiveKpis } from "@/hooks/use-live-kpis";
import type { IDashboardKpis, ITrendDataPoint, KpiMetric } from "@auto/shared";

const KPI_CONFIGS: { metric: KpiMetric; label: string; format: "number" | "currency" }[] = [
  { metric: "visitors", label: "Visiteurs", format: "number" },
  { metric: "registrations", label: "Inscriptions", format: "number" },
  { metric: "listings", label: "Annonces publiees", format: "number" },
  { metric: "contacts", label: "Contacts inities", format: "number" },
  { metric: "sales", label: "Ventes declarees", format: "number" },
  { metric: "revenue", label: "Revenu", format: "currency" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [initialKpis, setInitialKpis] = useState<IDashboardKpis | null>(null);
  const [trendData, setTrendData] = useState<ITrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { kpis, connectionStatus, updateInitialData } = useLiveKpis({
    initialData: initialKpis,
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [kpiData, trend] = await Promise.all([
        fetchDashboardKpis("week"),
        fetchDashboardTrend("visitors", 30),
      ]);
      setInitialKpis(kpiData);
      updateInitialData(kpiData);
      setTrendData(trend);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [updateInitialData]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleKpiClick = (metric: KpiMetric) => {
    router.push(`/admin/kpis/${metric}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Vue d&apos;ensemble des indicateurs cles de la plateforme.
          </p>
        </div>
        <div
          className="flex items-center gap-1 text-xs text-muted-foreground"
          data-testid="signalr-status"
        >
          {connectionStatus === "connected" ? (
            <Wifi className="size-3 text-green-600" />
          ) : (
            <WifiOff className="size-3" />
          )}
          {connectionStatus === "connected" ? "Temps reel" : "Hors ligne"}
        </div>
      </div>

      <AlertBanner />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div data-testid="dashboard-skeleton">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {KPI_CONFIGS.map((cfg) => (
              <KpiCardSkeleton key={cfg.metric} />
            ))}
          </div>
          <Skeleton className="mt-6 h-64 w-full rounded-lg" />
        </div>
      )}

      {!loading && kpis && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {KPI_CONFIGS.map((cfg) => (
              <KpiCard
                key={cfg.metric}
                label={cfg.label}
                data={kpis[cfg.metric]}
                format={cfg.format}
                onClick={() => handleKpiClick(cfg.metric)}
              />
            ))}
          </div>

          <TrendChart title="Tendance visiteurs - 30 jours" data={trendData} />
        </>
      )}
    </div>
  );
}
