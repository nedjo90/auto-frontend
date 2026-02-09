import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import {
  fetchDashboardKpis,
  fetchDashboardTrend,
  fetchKpiDrillDown,
  clearDashboardCache,
} from "@/lib/api/dashboard-api";

function mockOkResponse(data: unknown) {
  return { ok: true, json: () => Promise.resolve(data) };
}

describe("Dashboard API cache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearDashboardCache();
  });

  it("should cache fetchDashboardKpis and return cached value on second call", async () => {
    const kpiData = { visitors: { current: 10, previous: 5, trend: 100 } };
    mockApiClient.mockResolvedValue(mockOkResponse(kpiData));

    const first = await fetchDashboardKpis("week");
    const second = await fetchDashboardKpis("week");

    expect(first).toEqual(kpiData);
    expect(second).toEqual(kpiData);
    expect(mockApiClient).toHaveBeenCalledTimes(1);
  });

  it("should cache fetchDashboardTrend per metric and days", async () => {
    const trendData = [{ date: "2026-01-01", value: 10 }];
    mockApiClient.mockResolvedValue(mockOkResponse(trendData));

    await fetchDashboardTrend("visitors", 30);
    await fetchDashboardTrend("visitors", 30);

    expect(mockApiClient).toHaveBeenCalledTimes(1);
  });

  it("should not reuse cache for different parameters", async () => {
    const data1 = [{ date: "2026-01-01", value: 10 }];
    const data2 = [{ date: "2026-01-01", value: 20 }];
    mockApiClient
      .mockResolvedValueOnce(mockOkResponse(data1))
      .mockResolvedValueOnce(mockOkResponse(data2));

    const first = await fetchDashboardTrend("visitors", 7);
    const second = await fetchDashboardTrend("visitors", 30);

    expect(first).toEqual(data1);
    expect(second).toEqual(data2);
    expect(mockApiClient).toHaveBeenCalledTimes(2);
  });

  it("should cache fetchKpiDrillDown per metric and period", async () => {
    const drillData = [{ date: "2026-01-01", value: 5 }];
    mockApiClient.mockResolvedValue(mockOkResponse(drillData));

    await fetchKpiDrillDown("visitors", "week");
    await fetchKpiDrillDown("visitors", "week");

    expect(mockApiClient).toHaveBeenCalledTimes(1);
  });

  it("should clear all cache entries", async () => {
    const data = { visitors: { current: 1, previous: 0, trend: 0 } };
    mockApiClient.mockResolvedValue(mockOkResponse(data));

    await fetchDashboardKpis("week");
    clearDashboardCache();
    await fetchDashboardKpis("week");

    expect(mockApiClient).toHaveBeenCalledTimes(2);
  });

  it("should fetch KPIs in parallel (Promise.all pattern)", async () => {
    const kpiData = { visitors: { current: 10, previous: 5, trend: 100 } };
    const trendData = [{ date: "2026-01-01", value: 10 }];

    mockApiClient
      .mockResolvedValueOnce(mockOkResponse(kpiData))
      .mockResolvedValueOnce(mockOkResponse(trendData));

    const [kpis, trend] = await Promise.all([
      fetchDashboardKpis("week"),
      fetchDashboardTrend("visitors", 30),
    ]);

    expect(kpis).toEqual(kpiData);
    expect(trend).toEqual(trendData);
    expect(mockApiClient).toHaveBeenCalledTimes(2);
  });
});
