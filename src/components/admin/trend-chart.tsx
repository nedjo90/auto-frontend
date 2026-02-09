"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ITrendDataPoint } from "@auto/shared";

export interface TrendChartProps {
  title: string;
  data: ITrendDataPoint[];
  height?: number;
}

const PADDING = { top: 20, right: 16, bottom: 30, left: 50 };

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function TrendChart({ title, data, height = 240 }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground" data-testid="trend-empty">
            Aucune donnee disponible.
          </p>
        </CardContent>
      </Card>
    );
  }

  const width = 600;
  const chartWidth = width - PADDING.left - PADDING.right;
  const chartHeight = height - PADDING.top - PADDING.bottom;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: PADDING.left + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: PADDING.top + chartHeight - ((d.value - minVal) / range) * chartHeight,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PADDING.top + chartHeight} L ${points[0].x} ${PADDING.top + chartHeight} Z`;

  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks }, (_, i) => {
    const val = minVal + (range / (yTicks - 1)) * i;
    return {
      value: Math.round(val),
      y: PADDING.top + chartHeight - (i / (yTicks - 1)) * chartHeight,
    };
  });

  const xLabelInterval = Math.max(1, Math.floor(data.length / 6));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          role="img"
          aria-label={`${title} - graphique de tendance sur ${data.length} jours`}
          data-testid="trend-chart-svg"
        >
          {/* Grid lines */}
          {yLabels.map((tick, i) => (
            <line
              key={`grid-${i}`}
              x1={PADDING.left}
              y1={tick.y}
              x2={width - PADDING.right}
              y2={tick.y}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
          ))}

          {/* Y-axis labels */}
          {yLabels.map((tick, i) => (
            <text
              key={`label-${i}`}
              x={PADDING.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {tick.value}
            </text>
          ))}

          {/* X-axis labels */}
          {data.map(
            (d, i) =>
              i % xLabelInterval === 0 && (
                <text
                  key={`x-${d.date}`}
                  x={points[i].x}
                  y={height - 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {formatDateLabel(d.date)}
                </text>
              ),
          )}

          {/* Area fill */}
          <path d={areaPath} fill="currentColor" fillOpacity={0.08} />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeOpacity={0.6}
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={data[i].date}
              cx={p.x}
              cy={p.y}
              r={2.5}
              fill="currentColor"
              fillOpacity={0.8}
            />
          ))}
        </svg>
      </CardContent>
    </Card>
  );
}
