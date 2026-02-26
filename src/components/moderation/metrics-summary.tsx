"use client";

import { AlertCircle, Clock, CheckCircle2, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { IReportMetrics } from "@auto/shared";

interface MetricsSummaryProps {
  metrics: IReportMetrics | null;
  loading?: boolean;
}

export function MetricsSummary({ metrics, loading }: MetricsSummaryProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        data-testid="metrics-skeleton"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      label: "En attente",
      value: metrics.pendingCount,
      icon: AlertCircle,
      color: "text-orange-600",
      testId: "metric-pending",
    },
    {
      label: "En cours",
      value: metrics.inProgressCount,
      icon: Clock,
      color: "text-blue-600",
      testId: "metric-in-progress",
    },
    {
      label: "Traites cette semaine",
      value: metrics.treatedThisWeek,
      icon: CheckCircle2,
      color: "text-green-600",
      testId: "metric-treated",
    },
    {
      label: "Rejetes cette semaine",
      value: metrics.dismissedThisWeek,
      icon: XCircle,
      color: "text-gray-600",
      testId: "metric-dismissed",
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4" data-testid="metrics-summary">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.testId}>
              <CardContent className="p-3 sm:p-4" data-testid={card.testId}>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-1">
                  <Icon className={`size-4 ${card.color}`} />
                  <span>{card.label}</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly trend */}
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground"
        data-testid="weekly-trend"
      >
        {metrics.weeklyTrend >= 0 ? (
          <TrendingUp className="size-4 text-green-600" />
        ) : (
          <TrendingDown className="size-4 text-red-600" />
        )}
        <span>
          Tendance hebdomadaire :{" "}
          <span
            className={
              metrics.weeklyTrend >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"
            }
          >
            {metrics.weeklyTrend >= 0 ? "+" : ""}
            {metrics.weeklyTrend}%
          </span>
        </span>
      </div>
    </div>
  );
}
