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
});
