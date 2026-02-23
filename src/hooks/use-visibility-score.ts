"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSignalR, type SignalRStatus } from "./use-signalr";
import { apiClient } from "@/lib/auth/api-client";
import type { ScoreSuggestion, VisibilityScoreResult } from "@auto/shared";

export interface VisibilityScoreState {
  score: number;
  previousScore: number;
  label: string;
  suggestions: ScoreSuggestion[];
  normalizedScore?: number;
  normalizationMessage?: string;
}

export interface UseVisibilityScoreOptions {
  listingId: string | null;
  enabled?: boolean;
  pollingIntervalMs?: number;
}

const INITIAL_STATE: VisibilityScoreState = {
  score: 0,
  previousScore: 0,
  label: "",
  suggestions: [],
};

const DEFAULT_POLLING_INTERVAL = 5000;

/**
 * Hook for receiving real-time visibility score updates via SignalR.
 * Falls back to polling if SignalR connection fails.
 */
export function useVisibilityScore({
  listingId,
  enabled = true,
  pollingIntervalMs = DEFAULT_POLLING_INTERVAL,
}: UseVisibilityScoreOptions) {
  const [state, setState] = useState<VisibilityScoreState>(INITIAL_STATE);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPollingRef = useRef(false);

  const applyScoreUpdate = useCallback((result: VisibilityScoreResult) => {
    setState((prev) => ({
      score: result.score,
      previousScore: prev.score,
      label: result.label,
      suggestions: result.suggestions,
      normalizedScore: result.normalizedScore,
      normalizationMessage: result.normalizationMessage,
    }));
  }, []);

  const handleScoreUpdate = useCallback(
    (data: unknown) => {
      const result = data as VisibilityScoreResult;
      if (result && typeof result.score === "number") {
        applyScoreUpdate(result);
      }
    },
    [applyScoreUpdate],
  );

  const { status: signalRStatus } = useSignalR({
    hubPath: "live-score",
    events: {
      scoreUpdate: handleScoreUpdate,
    },
    enabled: enabled && !!listingId,
  });

  // Poll for score when SignalR fails
  const pollScore = useCallback(async () => {
    if (!listingId) return;
    try {
      const response = await apiClient("/api/seller/recalculateScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (response.ok) {
        const result: VisibilityScoreResult = await response.json();
        applyScoreUpdate(result);
      }
    } catch {
      // Silently ignore polling errors
    }
  }, [listingId, applyScoreUpdate]);

  // Derive whether we should be polling
  const shouldPoll = enabled && !!listingId && signalRStatus === "error";

  // Start/stop polling based on SignalR status
  useEffect(() => {
    if (shouldPoll && !pollingRef.current) {
      isPollingRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: pollScore is an async external-system subscription that sets state on response
      pollScore();
      pollingRef.current = setInterval(pollScore, pollingIntervalMs);
    } else if (!shouldPoll && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
      isPollingRef.current = false;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        isPollingRef.current = false;
      }
    };
  }, [shouldPoll, pollScore, pollingIntervalMs]);

  // Reset state when listing changes to null
  useEffect(() => {
    if (!listingId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset score state when listing is deselected
      setState(INITIAL_STATE);
    }
  }, [listingId]);

  // Derive isPolling from shouldPoll (synchronous with the polling effect)
  const isPolling = shouldPoll;

  const connectionStatus: SignalRStatus | "polling" = useMemo(
    () => (isPolling ? "polling" : signalRStatus),
    [isPolling, signalRStatus],
  );

  return {
    ...state,
    connectionStatus,
    isPolling,
  };
}
