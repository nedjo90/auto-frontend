"use client";

import { Loader2, CheckCircle2, XCircle, Database, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiSourceStatus } from "@auto/shared";

export interface SourceStatusProps {
  sources: ApiSourceStatus[];
}

const SOURCE_LABELS: Record<string, string> = {
  IVehicleLookupAdapter: "SIV",
  IEmissionAdapter: "ADEME",
  IRecallAdapter: "Rappels",
  ICritAirCalculator: "Crit'Air",
  IVINTechnicalAdapter: "VIN Tech",
};

/**
 * Displays per-adapter progress indicators (pending/done/failed/cached/stale).
 */
export function SourceStatus({ sources }: SourceStatusProps) {
  if (sources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" data-testid="source-status" aria-live="polite">
      {sources.map((source) => (
        <SourceIndicator key={source.adapterInterface} source={source} />
      ))}
    </div>
  );
}

function getStatusLabel(source: ApiSourceStatus): string {
  if (source.status === "success") return "terminé";
  if (source.status === "cached" && source.cacheStatus === "stale") return "obsolète";
  if (source.status === "cached") return "en cache";
  if (source.status === "failed") return "échoué";
  return "...";
}

function SourceIndicator({ source }: { source: ApiSourceStatus }) {
  const label = SOURCE_LABELS[source.adapterInterface] || source.adapterInterface;
  const isStale = source.status === "cached" && source.cacheStatus === "stale";

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        source.status === "pending" && "bg-muted text-muted-foreground",
        source.status === "success" &&
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        source.status === "failed" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        source.status === "cached" &&
          !isStale &&
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        isStale && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      )}
      data-testid={`source-${source.adapterInterface}`}
    >
      {source.status === "pending" && (
        <Loader2 className="size-3 animate-spin motion-reduce:animate-none" />
      )}
      {source.status === "success" && <CheckCircle2 className="size-3" />}
      {source.status === "failed" && <XCircle className="size-3" />}
      {source.status === "cached" && !isStale && <Database className="size-3" />}
      {isStale && <Clock className="size-3" />}
      <span>
        {label} {getStatusLabel(source)}
      </span>
    </div>
  );
}
