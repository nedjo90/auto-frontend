"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Lightbulb } from "lucide-react";
import { TrendChart } from "@/components/admin/trend-chart";
import { getMetricDrilldown } from "@/lib/api/seller-kpi-api";
import type { IMetricDrilldownData, SellerKpiMetric } from "@auto/shared";
import { SELLER_KPI_LABELS, SELLER_DRILLDOWN_PERIODS } from "@auto/shared";

export interface MetricDrilldownProps {
  metric: SellerKpiMetric;
  listingId?: string;
  onClose: () => void;
}

const PERIOD_LABELS: Record<number, string> = {
  7: "7 jours",
  30: "30 jours",
  90: "90 jours",
};

export function MetricDrilldown({ metric, listingId, onClose }: MetricDrilldownProps) {
  const [data, setData] = useState<IMetricDrilldownData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(30);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;

    getMetricDrilldown(metric, { listingId, periodDays })
      .then((d) => {
        if (fetchId === fetchIdRef.current) {
          setData(d);
          setLoading(false);
        }
      })
      .catch(() => {
        if (fetchId === fetchIdRef.current) {
          setData(null);
          setLoading(false);
        }
      });

    return () => {
      // Increment ref to invalidate any in-flight request
    };
  }, [metric, listingId, periodDays]);

  const handlePeriodChange = (p: number) => {
    setLoading(true);
    setPeriodDays(p);
  };

  return (
    <Card data-testid="metric-drilldown">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{SELLER_KPI_LABELS[metric]} - Détail</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} data-testid="drilldown-close">
          <X className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period selector */}
        <div className="flex gap-2" data-testid="period-selector">
          {SELLER_DRILLDOWN_PERIODS.map((p) => (
            <Button
              key={p}
              variant={periodDays === p ? "default" : "outline"}
              size="sm"
              onClick={() => handlePeriodChange(p)}
              data-testid={`period-${p}`}
            >
              {PERIOD_LABELS[p]}
            </Button>
          ))}
        </div>

        {/* Chart */}
        {loading ? (
          <Skeleton className="h-[240px] w-full" data-testid="drilldown-skeleton" />
        ) : data && data.points.length > 0 ? (
          <TrendChart
            title=""
            data={data.points.map((p) => ({ date: p.date, value: p.value }))}
            height={240}
          />
        ) : (
          <p className="text-sm text-muted-foreground" data-testid="drilldown-empty">
            Aucune donnée disponible pour cette période.
          </p>
        )}

        {/* Insights */}
        {data && data.insights.length > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-1" data-testid="drilldown-insights">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Lightbulb className="size-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
