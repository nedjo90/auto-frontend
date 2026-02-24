import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import { getBuyerHistoryReport, fetchSellerHistoryReport } from "@/lib/api/history-api";

const MOCK_REPORT_DATA = {
  vin: "VF1RFB00X56789012",
  ownerCount: 2,
  firstRegistrationDate: "2018-06-01",
  lastRegistrationDate: "2022-03-15",
  mileageRecords: [],
  accidents: [],
  registrationHistory: [],
  outstandingFinance: false,
  stolen: false,
  totalDamageCount: 0,
  provider: { providerName: "mock", providerVersion: "1.0.0" },
};

describe("history-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getBuyerHistoryReport", () => {
    it("should call the buyer endpoint and return parsed report", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            reportId: "report-1",
            source: "mock",
            fetchedAt: "2026-02-24T10:00:00.000Z",
            reportVersion: "1.0.0",
            reportData: JSON.stringify(MOCK_REPORT_DATA),
            isMockData: true,
          }),
      });

      const result = await getBuyerHistoryReport("listing-1");

      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/buyer/getHistoryReport"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result.reportId).toBe("report-1");
      expect(result.reportData.vin).toBe("VF1RFB00X56789012");
      expect(result.isMockData).toBe(true);
    });

    it("should handle reportData already as object", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            reportId: "report-1",
            source: "mock",
            fetchedAt: "2026-02-24T10:00:00.000Z",
            reportVersion: "1.0.0",
            reportData: MOCK_REPORT_DATA,
            isMockData: true,
          }),
      });

      const result = await getBuyerHistoryReport("listing-1");
      expect(result.reportData.vin).toBe("VF1RFB00X56789012");
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      });

      await expect(getBuyerHistoryReport("listing-1")).rejects.toThrow(
        "Failed to load history report",
      );
    });

    it("should throw on malformed reportData JSON", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            reportId: "report-1",
            source: "mock",
            fetchedAt: "2026-02-24T10:00:00.000Z",
            reportVersion: "1.0.0",
            reportData: "not-valid-json{{{",
            isMockData: true,
          }),
      });

      await expect(getBuyerHistoryReport("listing-1")).rejects.toThrow(
        "Invalid history report data received from server",
      );
    });
  });

  describe("fetchSellerHistoryReport", () => {
    it("should call the seller endpoint and return parsed report", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            reportId: "report-2",
            source: "mock",
            fetchedAt: "2026-02-24T10:00:00.000Z",
            reportVersion: "1.0.0",
            reportData: JSON.stringify(MOCK_REPORT_DATA),
          }),
      });

      const result = await fetchSellerHistoryReport("listing-1");

      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/seller/fetchHistoryReport"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result.reportId).toBe("report-2");
      expect(result.reportData.ownerCount).toBe(2);
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve("No VIN"),
      });

      await expect(fetchSellerHistoryReport("listing-1")).rejects.toThrow(
        "Failed to fetch history report",
      );
    });
  });
});
