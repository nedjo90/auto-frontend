"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSignalR } from "./use-signalr";
import type { IDashboardKpis, IKpiValue } from "@auto/shared";

export interface UseLiveKpisOptions {
  initialData: IDashboardKpis | null;
  enabled?: boolean;
}

interface KpiUpdatePayload {
  event: string;
  metric?: string;
  value?: Partial<IKpiValue>;
  timestamp?: string;
}

/**
 * Hook that merges initial KPI data with real-time SignalR updates.
 * Provides animated transition support via the `lastUpdate` timestamp.
 */
export function useLiveKpis({ initialData, enabled = true }: UseLiveKpisOptions) {
  const [kpis, setKpis] = useState<IDashboardKpis | null>(initialData);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const kpisRef = useRef(kpis);
  useEffect(() => {
    kpisRef.current = kpis;
  }, [kpis]);

  const handleKpiUpdate = useCallback((data: unknown) => {
    const payload = data as KpiUpdatePayload;
    if (!payload?.metric || !payload?.value) return;

    const metric = payload.metric as keyof IDashboardKpis;
    const currentKpis = kpisRef.current;
    if (!currentKpis || !(metric in currentKpis)) return;

    const currentValue = currentKpis[metric];
    if (!currentValue || typeof currentValue !== "object" || !("current" in currentValue)) return;

    setKpis((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [metric]: {
          ...(prev[metric] as IKpiValue),
          ...payload.value,
        },
      };
    });

    setLastUpdate(payload.timestamp || new Date().toISOString());
  }, []);

  const { status } = useSignalR({
    hubPath: "admin",
    events: {
      kpiUpdate: handleKpiUpdate,
    },
    enabled: enabled && !!initialData,
  });

  // Sync with new initial data
  const updateInitialData = useCallback((data: IDashboardKpis | null) => {
    setKpis(data);
  }, []);

  return {
    kpis,
    lastUpdate,
    connectionStatus: status,
    updateInitialData,
  };
}
