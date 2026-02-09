"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IKpiValue } from "@auto/shared";

export interface KpiCardProps {
  label: string;
  data: IKpiValue;
  format?: "number" | "currency";
  onClick?: () => void;
}

function formatValue(value: number, format: "number" | "currency"): string {
  if (format === "currency") {
    return `${value.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} \u20AC`;
  }
  return value.toLocaleString("fr-FR");
}

function formatTrend(trend: number): string {
  const sign = trend > 0 ? "+" : "";
  return `${sign}${trend.toFixed(1)}%`;
}

export function KpiCard({ label, data, format = "number", onClick }: KpiCardProps) {
  const isPositive = data.trend > 0;
  const isNegative = data.trend < 0;
  const isNeutral = data.trend === 0;

  return (
    <Card
      className={cn("transition-shadow", onClick && "cursor-pointer hover:shadow-md")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold" data-testid="kpi-value">
          {formatValue(data.current, format)}
        </p>
        <div className="mt-1 flex items-center gap-1 text-xs">
          {isPositive && <ArrowUp className="size-3 text-green-600" data-testid="trend-up" />}
          {isNegative && <ArrowDown className="size-3 text-red-600" data-testid="trend-down" />}
          {isNeutral && (
            <Minus className="size-3 text-muted-foreground" data-testid="trend-neutral" />
          )}
          <span
            className={cn(
              isPositive && "text-green-600",
              isNegative && "text-red-600",
              isNeutral && "text-muted-foreground",
            )}
            data-testid="trend-value"
          >
            {formatTrend(data.trend)}
          </span>
          <span className="text-muted-foreground">vs periode prec.</span>
        </div>
      </CardContent>
    </Card>
  );
}
