import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAggregateKPIs,
  getListingPerformance,
  getMetricDrilldown,
} from "@/lib/api/seller-kpi-api";

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

function mockJsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(""),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAggregateKPIs", () => {
  it("returns parsed KPI summary", async () => {
    const kpis = {
      activeListings: { current: 5, previous: 3, trend: 66.7 },
      totalViews: { current: 100, previous: 80, trend: 25 },
      totalContacts: { current: 10, previous: 8, trend: 25 },
      avgDaysOnline: { current: 15, previous: 12, trend: 25 },
    };
    mockApiClient.mockResolvedValue(mockJsonResponse({ kpis: JSON.stringify(kpis) }));

    const result = await getAggregateKPIs();
    expect(result.activeListings.current).toBe(5);
    expect(result.totalViews.current).toBe(100);
  });

  it("handles non-stringified response", async () => {
    const kpis = {
      activeListings: { current: 3, previous: 2, trend: 50 },
      totalViews: { current: 50, previous: 40, trend: 25 },
      totalContacts: { current: 5, previous: 4, trend: 25 },
      avgDaysOnline: { current: 10, previous: 8, trend: 25 },
    };
    mockApiClient.mockResolvedValue(mockJsonResponse({ kpis }));

    const result = await getAggregateKPIs();
    expect(result.activeListings.current).toBe(3);
  });

  it("throws on error response", async () => {
    mockApiClient.mockResolvedValue(mockJsonResponse({}, false, 500));
    await expect(getAggregateKPIs()).rejects.toThrow("Failed to fetch KPIs");
  });
});

describe("getListingPerformance", () => {
  it("returns listings and total", async () => {
    const listings = [{ ID: "1", make: "BMW" }];
    mockApiClient.mockResolvedValue(
      mockJsonResponse({ listings: JSON.stringify(listings), total: 1 }),
    );

    const result = await getListingPerformance({ sortBy: "price", sortDir: "desc" });
    expect(result.listings).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("uses default options when none provided", async () => {
    mockApiClient.mockResolvedValue(mockJsonResponse({ listings: "[]", total: 0 }));

    const result = await getListingPerformance();
    expect(result.listings).toEqual([]);
    expect(result.total).toBe(0);
    expect(mockApiClient).toHaveBeenCalledWith(
      expect.stringContaining("/api/seller/getListingPerformance"),
      expect.objectContaining({
        body: expect.stringContaining('"sortBy":"viewCount"'),
      }),
    );
  });

  it("throws on error response", async () => {
    mockApiClient.mockResolvedValue(mockJsonResponse({}, false, 403));
    await expect(getListingPerformance()).rejects.toThrow("Failed to fetch listing performance");
  });
});

describe("getMetricDrilldown", () => {
  it("returns parsed drilldown data", async () => {
    const drilldown = {
      metric: "totalViews",
      listingId: null,
      points: [{ date: "2026-02-01", value: 50 }],
      insights: ["Test insight"],
    };
    mockApiClient.mockResolvedValue(mockJsonResponse({ drilldown: JSON.stringify(drilldown) }));

    const result = await getMetricDrilldown("totalViews", { periodDays: 7 });
    expect(result.metric).toBe("totalViews");
    expect(result.points).toHaveLength(1);
    expect(result.insights).toHaveLength(1);
  });

  it("passes listingId when provided", async () => {
    mockApiClient.mockResolvedValue(
      mockJsonResponse({
        drilldown: JSON.stringify({
          metric: "totalViews",
          listingId: "listing-1",
          points: [],
          insights: [],
        }),
      }),
    );

    await getMetricDrilldown("totalViews", { listingId: "listing-1", periodDays: 30 });
    expect(mockApiClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: expect.stringContaining('"listingId":"listing-1"'),
      }),
    );
  });

  it("throws on error response", async () => {
    mockApiClient.mockResolvedValue(mockJsonResponse({}, false, 400));
    await expect(getMetricDrilldown("totalViews")).rejects.toThrow("Failed to fetch drilldown");
  });
});
