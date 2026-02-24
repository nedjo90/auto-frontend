"use client";

import { RefreshCw, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResyncState, ResyncResult } from "@/hooks/use-resync";
import type { ApiSourceStatus } from "@auto/shared";

export interface ResyncBannerProps {
  sources: ApiSourceStatus[];
  resyncState: ResyncState;
  resyncResult: ResyncResult | null;
  resyncError: string | null;
  onResync: () => void;
  className?: string;
}

const SOURCE_LABELS: Record<string, string> = {
  IVehicleLookupAdapter: "SIV",
  IEmissionAdapter: "ADEME",
  IRecallAdapter: "Rappels",
  ICritAirCalculator: "Crit'Air",
  IVINTechnicalAdapter: "VIN Tech",
};

/**
 * Banner displayed when auto-fill sources returned stale/cached data.
 * Offers a re-sync action to refresh the data from live APIs.
 */
export function ResyncBanner({
  sources,
  resyncState,
  resyncResult,
  resyncError,
  onResync,
  className,
}: ResyncBannerProps) {
  const staleSources = sources.filter((s) => s.status === "cached" && s.cacheStatus === "stale");
  const failedSources = sources.filter((s) => s.status === "failed");
  const degradedSources = [...staleSources, ...failedSources];

  if (degradedSources.length === 0 && resyncState === "idle") return null;

  // After successful resync
  if (resyncState === "done" && resyncResult) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
          resyncResult.success
            ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
            : "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200",
          className,
        )}
        data-testid="resync-banner"
        role="status"
      >
        <CheckCircle2 className="size-4 shrink-0" />
        <span>
          {resyncResult.updatedFieldCount} champ{resyncResult.updatedFieldCount > 1 ? "s" : ""} mis
          à jour.
          {resyncResult.failedAdapters.length > 0 && (
            <>
              {" "}
              {resyncResult.failedAdapters.length} source
              {resyncResult.failedAdapters.length > 1 ? "s" : ""} toujours indisponible
              {resyncResult.failedAdapters.length > 1 ? "s" : ""}.
            </>
          )}
        </span>
      </div>
    );
  }

  // Error state
  if (resyncState === "error" && resyncError) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
          className,
        )}
        data-testid="resync-banner"
        role="alert"
      >
        <XCircle className="size-4 shrink-0" />
        <span>{resyncError}</span>
      </div>
    );
  }

  // Syncing state
  if (resyncState === "syncing") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
          className,
        )}
        data-testid="resync-banner"
        role="status"
      >
        <Loader2 className="size-4 shrink-0 animate-spin motion-reduce:animate-none" />
        <span>Re-synchronisation en cours...</span>
      </div>
    );
  }

  // Default: show degraded sources with resync button
  const sourceLabels = degradedSources
    .map((s) => SOURCE_LABELS[s.adapterInterface] || s.adapterInterface)
    .join(", ");

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-800 sm:flex-row sm:items-center sm:justify-between dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200",
        className,
      )}
      data-testid="resync-banner"
      role="status"
    >
      <div className="flex items-center gap-2">
        <Clock className="size-4 shrink-0" />
        <span>Certaines données sont obsolètes ou indisponibles ({sourceLabels}).</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onResync}
        disabled={resyncState === "checking"}
        data-testid="resync-button"
        className="shrink-0"
      >
        {resyncState === "checking" ? (
          <Loader2 className="size-3 animate-spin motion-reduce:animate-none" />
        ) : (
          <RefreshCw className="size-3" />
        )}
        Re-synchroniser
      </Button>
    </div>
  );
}
