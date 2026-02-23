"use client";

import { memo, useMemo } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { VISIBILITY_LABELS, DEFAULT_VISIBILITY_WEIGHTS } from "@auto/shared";
import { cn } from "@/lib/utils";

export interface VisibilityScoreGaugeProps {
  score: number;
  label?: string;
  previousScore?: number;
  normalizationMessage?: string;
  className?: string;
}

/** Maps a score 0-100 to a rotation angle on a semicircle (0deg = left, 180deg = right). */
function scoreToAngle(score: number): number {
  return Math.min(Math.max(score, 0), 100) * 1.8;
}

/** Returns the color class based on score thresholds. */
function getScoreColor(score: number): string {
  if (score < DEFAULT_VISIBILITY_WEIGHTS.labelThresholdLow) return "text-red-500";
  if (score < DEFAULT_VISIBILITY_WEIGHTS.labelThresholdHigh) return "text-yellow-500";
  return "text-green-500";
}

/** Returns the stroke color for the SVG arc based on score. */
function getStrokeColor(score: number): string {
  if (score < DEFAULT_VISIBILITY_WEIGHTS.labelThresholdLow) return "#ef4444"; // red-500
  if (score < DEFAULT_VISIBILITY_WEIGHTS.labelThresholdHigh) return "#eab308"; // yellow-500
  return "#22c55e"; // green-500
}

/** Returns the qualitative French label for the score. */
function getScoreLabel(score: number): string {
  if (score < DEFAULT_VISIBILITY_WEIGHTS.labelThresholdLow) return VISIBILITY_LABELS.low;
  if (score < DEFAULT_VISIBILITY_WEIGHTS.labelThresholdHigh) return VISIBILITY_LABELS.medium;
  return VISIBILITY_LABELS.high;
}

/**
 * Calculates the SVG arc path for a semicircular gauge.
 * The arc goes from left (180deg) to right (0deg) — standard semicircle.
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const startRad = ((180 - startAngle) * Math.PI) / 180;
  const endRad = ((180 - endAngle) * Math.PI) / 180;

  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy - r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy - r * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
}

/**
 * Animated semicircular gauge displaying a visibility score 0-100.
 * Uses CSS transitions for spring animation (500ms).
 * Respects prefers-reduced-motion.
 */
export const VisibilityScoreGauge = memo(function VisibilityScoreGauge({
  score,
  label: labelProp,
  previousScore,
  normalizationMessage,
  className,
}: VisibilityScoreGaugeProps) {
  const reducedMotion = useReducedMotion();
  const clampedScore = Math.min(Math.max(Math.round(score), 0), 100);
  const angle = scoreToAngle(clampedScore);
  // Prefer backend-provided label (respects admin-configured thresholds), fall back to client-side default
  const label = labelProp || getScoreLabel(clampedScore);
  const strokeColor = getStrokeColor(clampedScore);
  const colorClass = getScoreColor(clampedScore);

  // SVG dimensions
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 80;
  const strokeWidth = 12;

  // Calculate the arc paths
  const bgArc = describeArc(cx, cy, radius, 0, 180);
  const valueArc = useMemo(
    () => (angle > 0 ? describeArc(cx, cy, radius, 0, angle) : ""),
    [cx, cy, radius, angle],
  );

  // Calculate the total circumference of the semicircle for strokeDasharray
  const semiCircumference = Math.PI * radius;
  const valueDashLength = (angle / 180) * semiCircumference;

  // Delta display
  const delta = previousScore !== undefined ? clampedScore - Math.round(previousScore) : 0;

  return (
    <div
      className={cn("sticky top-4 flex flex-col items-center", className)}
      data-testid="visibility-score-gauge"
      role="meter"
      aria-label={`Score de visibilite: ${clampedScore} sur 100`}
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 10}
          viewBox={`0 0 ${size} ${size / 2 + 10}`}
          data-testid="gauge-svg"
        >
          {/* Background arc (gray) */}
          <path
            d={bgArc}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value arc (colored) */}
          {angle > 0 && (
            <path
              d={valueArc}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${valueDashLength} ${semiCircumference}`}
              style={
                reducedMotion
                  ? undefined
                  : {
                      transition:
                        "stroke-dasharray 500ms cubic-bezier(0.34, 1.56, 0.64, 1), stroke 500ms ease",
                    }
              }
              data-testid="gauge-value-arc"
            />
          )}
        </svg>

        {/* Score number in the center */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-end pb-2"
          style={{ height: size / 2 + 10 }}
        >
          <span
            className={cn("text-4xl font-bold tabular-nums", colorClass)}
            style={reducedMotion ? undefined : { transition: "color 500ms ease" }}
            data-testid="gauge-score"
          >
            {clampedScore}
          </span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Qualitative label */}
      <p className={cn("text-sm font-medium mt-1", colorClass)} data-testid="gauge-label">
        {label}
      </p>

      {/* Delta indicator */}
      {delta !== 0 && (
        <p
          className={cn("text-xs mt-1", delta > 0 ? "text-green-600" : "text-red-600")}
          data-testid="gauge-delta"
          aria-label={delta > 0 ? `Plus ${delta} points` : `Moins ${Math.abs(delta)} points`}
        >
          {delta > 0 ? `+${delta}` : delta} pts
        </p>
      )}

      {/* Age normalization message */}
      {normalizationMessage && (
        <p
          className="text-xs text-muted-foreground mt-2 text-center italic"
          data-testid="gauge-normalization"
        >
          {normalizationMessage}
        </p>
      )}
    </div>
  );
});
