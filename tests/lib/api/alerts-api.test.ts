import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import { fetchActiveAlerts, acknowledgeAlert } from "@/lib/api/alerts-api";

describe("alerts-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchActiveAlerts", () => {
    it("should POST to getActiveAlerts and return alert events", async () => {
      const mockAlerts = [
        { ID: "a1", ruleId: "r1", level: "warning", message: "CPU high" },
        { ID: "a2", ruleId: "r2", level: "critical", message: "Disk full" },
      ];
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      });

      const result = await fetchActiveAlerts();

      expect(result).toEqual(mockAlerts);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/getActiveAlerts"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }),
      );
    });

    it("should return empty array when API returns empty list", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await fetchActiveAlerts();
      expect(result).toEqual([]);
    });

    it("should throw on non-ok response with status code", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(fetchActiveAlerts()).rejects.toThrow(
        "Failed to fetch active alerts: 500",
      );
    });

    it("should throw on 403 forbidden response", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 403 });

      await expect(fetchActiveAlerts()).rejects.toThrow(
        "Failed to fetch active alerts: 403",
      );
    });

    it("should throw on 404 not found response", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(fetchActiveAlerts()).rejects.toThrow(
        "Failed to fetch active alerts: 404",
      );
    });
  });

  describe("acknowledgeAlert", () => {
    it("should POST alertEventId and return success result", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Alert acknowledged" }),
      });

      const result = await acknowledgeAlert("alert-123");

      expect(result).toEqual({ success: true, message: "Alert acknowledged" });
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/acknowledgeAlert"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alertEventId: "alert-123" }),
        }),
      );
    });

    it("should pass the correct alertEventId in the request body", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "OK" }),
      });

      await acknowledgeAlert("event-xyz-456");

      const callArgs = mockApiClient.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.alertEventId).toBe("event-xyz-456");
    });

    it("should throw on non-ok response with status code", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(acknowledgeAlert("alert-123")).rejects.toThrow(
        "Failed to acknowledge alert: 500",
      );
    });

    it("should throw on 404 not found response", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(acknowledgeAlert("nonexistent")).rejects.toThrow(
        "Failed to acknowledge alert: 404",
      );
    });

    it("should throw on 403 forbidden response", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 403 });

      await expect(acknowledgeAlert("alert-123")).rejects.toThrow(
        "Failed to acknowledge alert: 403",
      );
    });
  });
});
