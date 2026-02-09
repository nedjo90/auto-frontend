import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import {
  fetchConfigEntities,
  updateConfigEntity,
  createConfigEntity,
  deleteConfigEntity,
  estimateConfigImpact,
  fetchApiCostSummary,
  fetchProviderAnalytics,
  switchProvider,
} from "@/lib/api/config-api";

describe("config-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchConfigEntities", () => {
    it("should fetch entities and return value array", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: [{ ID: "1", key: "test" }] }),
      });

      const result = await fetchConfigEntities("ConfigParameters");
      expect(result).toEqual([{ ID: "1", key: "test" }]);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/ConfigParameters"),
      );
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 403 });
      await expect(fetchConfigEntities("ConfigParameters")).rejects.toThrow("Failed to fetch");
    });
  });

  describe("updateConfigEntity", () => {
    it("should PATCH entity by ID", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: true });

      await updateConfigEntity("ConfigParameters", "p1", { value: "42" });
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/ConfigParameters(p1)"),
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ value: "42" }),
        }),
      );
    });

    it("should throw on failure", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal error",
      });
      await expect(updateConfigEntity("ConfigParameters", "p1", { value: "x" })).rejects.toThrow(
        "Failed to update",
      );
    });
  });

  describe("createConfigEntity", () => {
    it("should POST new entity", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ID: "new-1", key: "new" }),
      });

      const result = await createConfigEntity("ConfigParameters", { key: "new", value: "1" });
      expect(result).toEqual({ ID: "new-1", key: "new" });
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/ConfigParameters"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  describe("deleteConfigEntity", () => {
    it("should DELETE entity by ID", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: true, status: 204 });

      await deleteConfigEntity("ConfigParameters", "p1");
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/ConfigParameters(p1)"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  describe("estimateConfigImpact", () => {
    it("should POST to estimateConfigImpact action", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ affectedCount: 10, message: "Impact message" }),
      });

      const result = await estimateConfigImpact("listing.price");
      expect(result).toEqual({ affectedCount: 10, message: "Impact message" });
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/estimateConfigImpact"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ parameterKey: "listing.price" }),
        }),
      );
    });
  });

  describe("fetchApiCostSummary", () => {
    it("should POST to getApiCostSummary action", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          totalCost: 1.5,
          callCount: 100,
          avgCostPerCall: 0.015,
          byProvider: "[]",
        }),
      });

      const result = await fetchApiCostSummary("week");
      expect(result.totalCost).toBe(1.5);
      expect(result.callCount).toBe(100);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/getApiCostSummary"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ period: "week" }),
        }),
      );
    });

    it("should throw on failure", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 400 });
      await expect(fetchApiCostSummary("invalid")).rejects.toThrow("Failed to fetch cost summary");
    });
  });

  describe("fetchProviderAnalytics", () => {
    it("should POST to getProviderAnalytics action", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          avgResponseTimeMs: 150,
          successRate: 99.5,
          totalCalls: 500,
          totalCost: 5.0,
          avgCostPerCall: 0.01,
        }),
      });

      const result = await fetchProviderAnalytics("azure.adb2c");
      expect(result.totalCalls).toBe(500);
      expect(result.successRate).toBe(99.5);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/getProviderAnalytics"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ providerKey: "azure.adb2c" }),
        }),
      );
    });

    it("should throw on failure", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 400 });
      await expect(fetchProviderAnalytics("bad")).rejects.toThrow(
        "Failed to fetch provider analytics",
      );
    });
  });

  describe("switchProvider", () => {
    it("should POST to switchProvider action", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: "Provider switched." }),
      });

      const result = await switchProvider("IIdentityProviderAdapter", "azure.adb2c");
      expect(result.success).toBe(true);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/switchProvider"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            adapterInterface: "IIdentityProviderAdapter",
            newProviderKey: "azure.adb2c",
          }),
        }),
      );
    });

    it("should throw on failure", async () => {
      mockApiClient.mockResolvedValueOnce({ ok: false, status: 404 });
      await expect(switchProvider("ITest", "missing")).rejects.toThrow("Failed to switch provider");
    });
  });

  describe("entity name validation", () => {
    it("should reject invalid entity names", async () => {
      await expect(fetchConfigEntities("../../sensitive")).rejects.toThrow(
        "Invalid config entity name",
      );
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it("should accept valid entity names", async () => {
      mockApiClient.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ value: [] }),
      });
      await expect(fetchConfigEntities("ConfigParameters")).resolves.toEqual([]);
    });
  });
});
