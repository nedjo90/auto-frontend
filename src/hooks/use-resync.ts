"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/auth/api-client";
import type { IResyncAdapterAvailability } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type ResyncState = "idle" | "checking" | "available" | "syncing" | "done" | "error";

export interface ResyncResult {
  success: boolean;
  updatedFieldCount: number;
  failedAdapters: string[];
}

export interface UseResyncResult {
  state: ResyncState;
  availableAdapters: IResyncAdapterAvailability[];
  result: ResyncResult | null;
  error: string | null;
  checkAvailability: (listingId: string) => Promise<void>;
  resync: (listingId: string, adapterNames: string[]) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing listing re-sync flow.
 * Checks which adapters can re-certify stale fields and triggers re-sync.
 */
export function useResync(): UseResyncResult {
  const [state, setState] = useState<ResyncState>("idle");
  const [availableAdapters, setAvailableAdapters] = useState<IResyncAdapterAvailability[]>([]);
  const [result, setResult] = useState<ResyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async (listingId: string) => {
    setState("checking");
    setError(null);

    try {
      const res = await apiClient(`${API_BASE}/api/seller/checkResyncAvailability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message || `Erreur ${res.status}`);
      }

      const data = await res.json();
      const adapters: IResyncAdapterAvailability[] = data.availableAdapters
        ? JSON.parse(data.availableAdapters)
        : [];

      setAvailableAdapters(adapters);
      setState(adapters.some((a) => a.isAvailable) ? "available" : "idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de vérification");
      setState("error");
    }
  }, []);

  const resync = useCallback(async (listingId: string, adapterNames: string[]) => {
    setState("syncing");
    setError(null);

    try {
      const res = await apiClient(`${API_BASE}/api/seller/resyncListing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          adapterNames: JSON.stringify(adapterNames),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error?.message || `Erreur ${res.status}`);
      }

      const data = await res.json();
      const updatedFields = data.updatedFields ? JSON.parse(data.updatedFields) : [];
      const failedAdapters = data.failedAdapters ? JSON.parse(data.failedAdapters) : [];

      setResult({
        success: data.success,
        updatedFieldCount: updatedFields.length,
        failedAdapters,
      });
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de re-synchronisation");
      setState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setAvailableAdapters([]);
    setResult(null);
    setError(null);
  }, []);

  return { state, availableAdapters, result, error, checkAvailability, resync, reset };
}
