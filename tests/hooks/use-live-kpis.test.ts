/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, cleanup } from "@testing-library/react";
import type { IDashboardKpis } from "@auto/shared";

vi.mock("@/hooks/use-signalr", () => ({
  useSignalR: vi.fn(({ events }: { events: Record<string, (data: unknown) => void> }) => {
    // Store the event handlers for later invocation in tests
    (globalThis as any).__signalrHandlers = events;
    return { status: "connected", disconnect: vi.fn() };
  }),
}));

const mockClearDashboardCache = vi.fn();
vi.mock("@/lib/api/dashboard-api", () => ({
  clearDashboardCache: (...args: unknown[]) => mockClearDashboardCache(...args),
}));

import { useLiveKpis } from "@/hooks/use-live-kpis";

const mockKpis: IDashboardKpis = {
  visitors: { current: 100, previous: 80, trend: 25 },
  registrations: { current: 10, previous: 8, trend: 25 },
  listings: { current: 50, previous: 40, trend: 25 },
  contacts: { current: 20, previous: 15, trend: 33.3 },
  sales: { current: 5, previous: 4, trend: 25 },
  revenue: { current: 1500, previous: 1200, trend: 25 },
  trafficSources: [],
};

describe("useLiveKpis", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockClearDashboardCache.mockReset();
    (globalThis as any).__signalrHandlers = {};
  });

  it("should return initial data", () => {
    const { result } = renderHook(() => useLiveKpis({ initialData: mockKpis }));
    expect(result.current.kpis).toEqual(mockKpis);
    expect(result.current.connectionStatus).toBe("connected");
  });

  it("should return null when no initial data", () => {
    const { result } = renderHook(() => useLiveKpis({ initialData: null }));
    expect(result.current.kpis).toBeNull();
  });

  it("should update KPI when receiving kpiUpdate event", () => {
    const { result } = renderHook(() => useLiveKpis({ initialData: mockKpis }));

    const handlers = (globalThis as any).__signalrHandlers;
    expect(handlers.kpiUpdate).toBeDefined();

    act(() => {
      handlers.kpiUpdate({
        metric: "visitors",
        value: { current: 150 },
        timestamp: "2026-02-09T15:00:00Z",
      });
    });

    expect(result.current.kpis?.visitors.current).toBe(150);
    expect(result.current.lastUpdate).toBe("2026-02-09T15:00:00Z");
  });

  it("should ignore updates for unknown metrics", () => {
    const { result } = renderHook(() => useLiveKpis({ initialData: mockKpis }));

    const handlers = (globalThis as any).__signalrHandlers;

    act(() => {
      handlers.kpiUpdate({
        metric: "unknown",
        value: { current: 999 },
      });
    });

    // Should remain unchanged
    expect(result.current.kpis?.visitors.current).toBe(100);
  });

  it("should ignore updates without metric or value", () => {
    const { result } = renderHook(() => useLiveKpis({ initialData: mockKpis }));

    const handlers = (globalThis as any).__signalrHandlers;

    act(() => {
      handlers.kpiUpdate({});
    });

    expect(result.current.kpis?.visitors.current).toBe(100);
  });

  it("should clear dashboard cache when receiving kpiUpdate event", () => {
    renderHook(() => useLiveKpis({ initialData: mockKpis }));

    const handlers = (globalThis as any).__signalrHandlers;

    act(() => {
      handlers.kpiUpdate({
        metric: "visitors",
        value: { current: 200 },
        timestamp: "2026-02-09T16:00:00Z",
      });
    });

    expect(mockClearDashboardCache).toHaveBeenCalledTimes(1);
  });

  it("should update initial data via updateInitialData", () => {
    const { result } = renderHook(() => useLiveKpis({ initialData: null }));

    expect(result.current.kpis).toBeNull();

    act(() => {
      result.current.updateInitialData(mockKpis);
    });

    expect(result.current.kpis).toEqual(mockKpis);
  });
});
