"use client";

import { Loader2, CheckCircle2, XCircle, Database } from "lucide-react";
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
 * Displays per-adapter progress indicators (pending/done/failed/cached).
 */
export function SourceStatus({ sources }: SourceStatusProps) {
  if (sources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" data-testid="source-status">
      {sources.map((source) => (
        <SourceIndicator key={source.adapterInterface} source={source} />
      ))}
    </div>
  );
}

function SourceIndicator({ source }: { source: ApiSourceStatus }) {
  const label = SOURCE_LABELS[source.adapterInterface] || source.adapterInterface;

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        source.status === "pending" && "bg-muted text-muted-foreground",
        source.status === "success" && "bg-green-100 text-green-800",
        source.status === "failed" && "bg-red-100 text-red-800",
        source.status === "cached" && "bg-blue-100 text-blue-800",
      )}
      data-testid={`source-${source.adapterInterface}`}
    >
      {source.status === "pending" && <Loader2 className="size-3 animate-spin" />}
      {source.status === "success" && <CheckCircle2 className="size-3" />}
      {source.status === "failed" && <XCircle className="size-3" />}
      {source.status === "cached" && <Database className="size-3" />}
      <span>
        {label}{" "}
        {source.status === "success"
          ? "done"
          : source.status === "cached"
            ? "cached"
            : source.status === "failed"
              ? "failed"
              : "..."}
      </span>
    </div>
  );
}
