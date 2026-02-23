/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import type { VisibilityScoreResult } from "@auto/shared";

let mockSignalRStatus = "connected";
vi.mock("@/hooks/use-signalr", () => ({
  useSignalR: vi.fn(({ events }: { events: Record<string, (data: unknown) => void> }) => {
    (globalThis as any).__signalrHandlers = events;
    return { status: mockSignalRStatus, disconnect: vi.fn() };
  }),
}));

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import { useVisibilityScore } from "@/hooks/use-visibility-score";

const mockScoreResult: VisibilityScoreResult = {
  score: 72,
  label: "Bien documente",
  suggestions: [
    { field: "description", message: "Ajoutez une description", boost: 5 },
    { field: "photo", message: "Ajoutez des photos", boost: 8 },
  ],
  normalizedScore: 80,
  normalizationMessage: "Bon score pour un vehicule de 2015",
};

describe("useVisibilityScore", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockSignalRStatus = "connected";
    (globalThis as any).__signalrHandlers = {};
    mockApiClient.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with zero score", () => {
    const { result } = renderHook(() => useVisibilityScore({ listingId: "listing-1" }));
    expect(result.current.score).toBe(0);
    expect(result.current.previousScore).toBe(0);
    expect(result.current.label).toBe("");
    expect(result.current.suggestions).toEqual([]);
  });

  it("should update score when receiving scoreUpdate event", () => {
    const { result } = renderHook(() => useVisibilityScore({ listingId: "listing-1" }));

    const handlers = (globalThis as any).__signalrHandlers;
    expect(handlers.scoreUpdate).toBeDefined();

    act(() => {
      handlers.scoreUpdate(mockScoreResult);
    });

    expect(result.current.score).toBe(72);
    expect(result.current.label).toBe("Bien documente");
    expect(result.current.suggestions).toHaveLength(2);
    expect(result.current.normalizedScore).toBe(80);
    expect(result.current.normalizationMessage).toBe("Bon score pour un vehicule de 2015");
  });

  it("should track previous score on update", () => {
    const { result } = renderHook(() => useVisibilityScore({ listingId: "listing-1" }));

    const handlers = (globalThis as any).__signalrHandlers;

    act(() => {
      handlers.scoreUpdate({ ...mockScoreResult, score: 50 });
    });

    expect(result.current.score).toBe(50);
    expect(result.current.previousScore).toBe(0);

    act(() => {
      handlers.scoreUpdate({ ...mockScoreResult, score: 72 });
    });

    expect(result.current.score).toBe(72);
    expect(result.current.previousScore).toBe(50);
  });

  it("should ignore invalid score updates", () => {
    const { result } = renderHook(() => useVisibilityScore({ listingId: "listing-1" }));

    const handlers = (globalThis as any).__signalrHandlers;

    act(() => {
      handlers.scoreUpdate({});
    });

    expect(result.current.score).toBe(0);

    act(() => {
      handlers.scoreUpdate(null);
    });

    expect(result.current.score).toBe(0);
  });

  it("should return connected status when SignalR is connected", () => {
    mockSignalRStatus = "connected";
    const { result } = renderHook(() => useVisibilityScore({ listingId: "listing-1" }));
    expect(result.current.connectionStatus).toBe("connected");
    expect(result.current.isPolling).toBe(false);
  });

  it("should fall back to polling when SignalR has error", async () => {
    mockSignalRStatus = "error";
    mockApiClient.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockScoreResult),
    });

    const { result } = renderHook(() => useVisibilityScore({ listingId: "listing-1" }));

    // Polling starts immediately when signalR status is error
    expect(result.current.connectionStatus).toBe("polling");
    expect(result.current.isPolling).toBe(true);

    // Wait for the first immediate poll
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockApiClient).toHaveBeenCalledWith("/api/listings/listing-1/recalculateScore", {
      method: "POST",
    });
    expect(result.current.score).toBe(72);
  });

  it("should poll at configured interval", async () => {
    mockSignalRStatus = "error";
    mockApiClient.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockScoreResult, score: 60 }),
    });

    renderHook(() =>
      useVisibilityScore({
        listingId: "listing-1",
        pollingIntervalMs: 3000,
      }),
    );

    // Wait for the immediate poll + any pending timers to settle
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    const callsAfterInit = mockApiClient.mock.calls.length;
    expect(callsAfterInit).toBeGreaterThanOrEqual(1);

    // Advance by one interval
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await vi.runOnlyPendingTimersAsync();
    });

    // Should have at least one more call
    expect(mockApiClient.mock.calls.length).toBeGreaterThan(callsAfterInit);
  });

  it("should silently handle polling errors", async () => {
    mockSignalRStatus = "error";
    mockApiClient.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useVisibilityScore({ listingId: "listing-1" }));

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    // Should not crash, score remains at 0
    expect(result.current.score).toBe(0);
  });

  it("should handle non-ok polling response", async () => {
    mockSignalRStatus = "error";
    mockApiClient.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useVisibilityScore({ listingId: "listing-1" }));

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    expect(result.current.score).toBe(0);
  });

  it("should reset state when listingId becomes null", () => {
    const { result, rerender } = renderHook(
      ({ listingId }: { listingId: string | null }) => useVisibilityScore({ listingId }),
      { initialProps: { listingId: "listing-1" as string | null } },
    );

    const handlers = (globalThis as any).__signalrHandlers;
    act(() => {
      handlers.scoreUpdate(mockScoreResult);
    });

    expect(result.current.score).toBe(72);

    rerender({ listingId: null });

    expect(result.current.score).toBe(0);
    expect(result.current.label).toBe("");
    expect(result.current.suggestions).toEqual([]);
  });

  it("should not connect when enabled is false", () => {
    const { result } = renderHook(() =>
      useVisibilityScore({ listingId: "listing-1", enabled: false }),
    );
    expect(result.current.score).toBe(0);
  });

  it("should not poll when listingId is null even if SignalR errors", async () => {
    mockSignalRStatus = "error";

    renderHook(() => useVisibilityScore({ listingId: null }));

    await act(async () => {
      vi.advanceTimersByTime(10000);
      await vi.runOnlyPendingTimersAsync();
    });

    expect(mockApiClient).not.toHaveBeenCalled();
  });
});
