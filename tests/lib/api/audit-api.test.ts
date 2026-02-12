import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = vi.fn();

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import {
  fetchAuditTrailEntries,
  fetchApiCallLogs,
  exportAuditTrailCsv,
  exportApiCallLogsCsv,
} from "@/lib/api/audit-api";

/** Decode URL for easier assertion (+ → space, then percent-decode). */
function decodedUrl(): string {
  const raw = mockApiClient.mock.calls[0][0] as string;
  return decodeURIComponent(raw.replace(/\+/g, " "));
}

describe("Audit API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchAuditTrailEntries", () => {
    it("should call AuditTrailEntries endpoint with default params", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [], "@odata.count": 0 }),
      });

      const result = await fetchAuditTrailEntries();
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/AuditTrailEntries?"),
      );
      const url = decodedUrl();
      expect(url).toContain("$count=true");
      expect(url).toContain("$top=25");
      expect(url).toContain("$skip=0");
      expect(url).toContain("$orderby=timestamp desc");
      expect(result).toEqual({ entries: [], count: 0 });
    });

    it("should apply filters to OData query", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [], "@odata.count": 0 }),
      });

      await fetchAuditTrailEntries({
        action: "config.update",
        severity: "critical",
        targetType: "ConfigParameter",
      });

      const url = decodedUrl();
      expect(url).toContain("action eq 'config.update'");
      expect(url).toContain("severity eq 'critical'");
      expect(url).toContain("targetType eq 'ConfigParameter'");
    });

    it("should apply date range filters", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [], "@odata.count": 0 }),
      });

      await fetchAuditTrailEntries({
        dateFrom: "2026-01-01T00:00",
        dateTo: "2026-01-31T23:59",
      });

      const url = decodedUrl();
      expect(url).toContain("timestamp ge 2026-01-01T00:00");
      expect(url).toContain("timestamp le 2026-01-31T23:59");
    });

    it("should apply contains filter for actorId", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [], "@odata.count": 0 }),
      });

      await fetchAuditTrailEntries({ actorId: "abc123" });

      const url = decodedUrl();
      expect(url).toContain("contains(actorId,'abc123')");
    });

    it("should handle pagination parameters", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [{ ID: "e1" }], "@odata.count": 100 }),
      });

      const result = await fetchAuditTrailEntries({}, "timestamp asc", 50, 100);
      const url = decodedUrl();
      expect(url).toContain("$top=50");
      expect(url).toContain("$skip=100");
      expect(url).toContain("$orderby=timestamp asc");
      expect(result.entries).toHaveLength(1);
      expect(result.count).toBe(100);
    });

    it("should throw on error response", async () => {
      mockApiClient.mockResolvedValue({ ok: false, status: 403 });
      await expect(fetchAuditTrailEntries()).rejects.toThrow("Failed to fetch audit trail: 403");
    });

    it("should handle missing @odata.count", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [{ ID: "e1" }, { ID: "e2" }] }),
      });

      const result = await fetchAuditTrailEntries();
      expect(result.count).toBe(2);
    });
  });

  describe("fetchApiCallLogs", () => {
    it("should call ApiCallLogs endpoint with default params", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [], "@odata.count": 0 }),
      });

      const result = await fetchApiCallLogs();
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/ApiCallLogs?"),
      );
      expect(result).toEqual({ entries: [], count: 0 });
    });

    it("should apply provider and adapter filters", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [], "@odata.count": 0 }),
      });

      await fetchApiCallLogs({ provider: "mapbox", adapter: "GeocodingAdapter" });

      const url = decodedUrl();
      expect(url).toContain("providerKey eq 'mapbox'");
      expect(url).toContain("adapterInterface eq 'GeocodingAdapter'");
    });

    it("should apply listingId contains filter", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [], "@odata.count": 0 }),
      });

      await fetchApiCallLogs({ listingId: "lst-123" });

      const url = decodedUrl();
      expect(url).toContain("contains(listingId,'lst-123')");
    });

    it("should throw on error response", async () => {
      mockApiClient.mockResolvedValue({ ok: false, status: 500 });
      await expect(fetchApiCallLogs()).rejects.toThrow("Failed to fetch API call logs: 500");
    });
  });

  describe("exportAuditTrailCsv", () => {
    it("should call exportAuditTrail action with filters", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: "csv-data-here" }),
      });

      const csv = await exportAuditTrailCsv({ severity: "critical" });
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/exportAuditTrail"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ severity: "critical" }),
        }),
      );
      expect(csv).toBe("csv-data-here");
    });

    it("should throw on error response", async () => {
      mockApiClient.mockResolvedValue({ ok: false, status: 500 });
      await expect(exportAuditTrailCsv()).rejects.toThrow("Failed to export audit trail: 500");
    });
  });

  describe("exportApiCallLogsCsv", () => {
    it("should call exportApiCallLogs action with filters", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: "api-csv-data" }),
      });

      const csv = await exportApiCallLogsCsv({ provider: "mapbox" });
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/exportApiCallLogs"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ provider: "mapbox" }),
        }),
      );
      expect(csv).toBe("api-csv-data");
    });

    it("should throw on error response", async () => {
      mockApiClient.mockResolvedValue({ ok: false, status: 500 });
      await expect(exportApiCallLogsCsv()).rejects.toThrow("Failed to export API call logs: 500");
    });
  });
});
