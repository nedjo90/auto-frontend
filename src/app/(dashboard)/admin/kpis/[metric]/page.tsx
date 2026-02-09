"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendChart } from "@/components/admin/trend-chart";
import {
  fetchDashboardTrend,
  fetchKpiDrillDown,
  type DrillDownEntry,
} from "@/lib/api/dashboard-api";
import type { ITrendDataPoint } from "@auto/shared";

const METRIC_LABELS: Record<string, { title: string; unit: string; actionLabel: string }> = {
  visitors: { title: "Visiteurs", unit: "visites", actionLabel: "Voir les logs d'activite" },
  registrations: {
    title: "Inscriptions",
    unit: "inscriptions",
    actionLabel: "Voir les utilisateurs",
  },
  listings: { title: "Annonces publiees", unit: "annonces", actionLabel: "Voir les annonces" },
  contacts: { title: "Contacts inities", unit: "contacts", actionLabel: "Voir les messages" },
  sales: { title: "Ventes declarees", unit: "ventes", actionLabel: "Voir les transactions" },
  revenue: { title: "Revenu", unit: "\u20AC", actionLabel: "Voir les paiements" },
};

const VALID_METRICS = new Set([
  "visitors",
  "registrations",
  "listings",
  "contacts",
  "sales",
  "revenue",
]);

const PERIODS = [
  { value: "day", label: "24h" },
  { value: "week", label: "7j" },
  { value: "month", label: "30j" },
] as const;

export default function KpiDrillDownPage() {
  const params = useParams<{ metric: string }>();
  const router = useRouter();
  const metric = params.metric;

  const [trendData, setTrendData] = useState<ITrendDataPoint[]>([]);
  const [drillDownData, setDrillDownData] = useState<DrillDownEntry[]>([]);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metricConfig = METRIC_LABELS[metric] || { title: metric, unit: "", actionLabel: "" };
  const isValidMetric = VALID_METRICS.has(metric);

  const loadData = useCallback(async () => {
    if (!isValidMetric) return;
    try {
      setLoading(true);
      setError(null);
      const days = period === "day" ? 1 : period === "week" ? 7 : 30;
      const [trend, drillDown] = await Promise.all([
        fetchDashboardTrend(metric, days),
        fetchKpiDrillDown(metric, period),
      ]);
      setTrendData(trend);
      setDrillDownData(drillDown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [metric, period, isValidMetric]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!isValidMetric) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive" data-testid="invalid-metric">
          Metrique inconnue : {metric}
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push("/admin")}>
          <ArrowLeft className="mr-1 size-4" />
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  const total = drillDownData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin")}
            data-testid="back-button"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{metricConfig.title}</h1>
            <p className="text-muted-foreground text-sm">Detail par jour</p>
          </div>
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.value)}
              disabled={loading}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Chargement...
        </div>
      )}

      {!loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total ({metricConfig.unit})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="drilldown-total">
                  {total.toLocaleString("fr-FR")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Moyenne / jour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="drilldown-avg">
                  {drillDownData.length > 0 ? (total / drillDownData.length).toFixed(1) : "0"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Jours de donnees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold" data-testid="drilldown-days">
                  {drillDownData.length}
                </p>
              </CardContent>
            </Card>
          </div>

          <TrendChart title={`${metricConfig.title} - Tendance`} data={trendData} />

          {drillDownData.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Detail par jour</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Valeur</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drillDownData.map((entry) => (
                    <TableRow key={entry.date}>
                      <TableCell>{new Date(entry.date).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>{entry.value.toLocaleString("fr-FR")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {drillDownData.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune donnee pour cette periode.</p>
          )}
        </>
      )}
    </div>
  );
}
