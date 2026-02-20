"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/auth/api-client";
import type { IdentifierType, CertifiedFieldResult, ApiSourceStatus } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type AutoFillState = "idle" | "loading" | "success" | "partial" | "error";

export interface UseVehicleLookupResult {
  state: AutoFillState;
  fields: CertifiedFieldResult[];
  sources: ApiSourceStatus[];
  error: string | null;
  lookup: (identifier: string, identifierType: IdentifierType) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for managing vehicle auto-fill state.
 * Calls the backend autoFillByPlate action and manages response state.
 */
export function useVehicleLookup(): UseVehicleLookupResult {
  const [state, setState] = useState<AutoFillState>("idle");
  const [fields, setFields] = useState<CertifiedFieldResult[]>([]);
  const [sources, setSources] = useState<ApiSourceStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (identifier: string, identifierType: IdentifierType) => {
    setState("loading");
    setError(null);
    setFields([]);
    setSources([]);

    try {
      const res = await apiClient(`${API_BASE}/api/seller/autoFillByPlate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, identifierType }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const message = errData?.error?.message || `Erreur ${res.status}`;
        setError(message);
        setState("error");
        return;
      }

      const data = await res.json();
      const parsedFields: CertifiedFieldResult[] = data.fields ? JSON.parse(data.fields) : [];
      const parsedSources: ApiSourceStatus[] = data.sources ? JSON.parse(data.sources) : [];

      setFields(parsedFields);
      setSources(parsedSources);

      // Determine state based on source statuses
      const failedCount = parsedSources.filter((s) => s.status === "failed").length;
      if (failedCount === 0) {
        setState("success");
      } else if (failedCount < parsedSources.length) {
        setState("partial");
      } else {
        setState("error");
        setError("Tous les services sont indisponibles");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
      setState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setFields([]);
    setSources([]);
    setError(null);
  }, []);

  return { state, fields, sources, error, lookup, reset };
}
