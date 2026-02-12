import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = vi.fn();

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

// Re-mock fetch globally for public endpoints
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import {
  publishLegalVersion,
  getLegalAcceptanceCount,
  getCurrentLegalVersion,
  checkLegalAcceptance,
  acceptLegalDocument,
} from "@/lib/api/legal-api";

describe("Legal API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("publishLegalVersion", () => {
    it("should call admin endpoint with correct payload", async () => {
      const mockResult = { ID: "v1", version: 2, content: "New" };
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const result = await publishLegalVersion("doc-1", "New content", "Summary", true);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/admin/publishLegalVersion"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            documentId: "doc-1",
            content: "New content",
            summary: "Summary",
            requiresReacceptance: true,
          }),
        }),
      );
      expect(result).toEqual(mockResult);
    });

    it("should throw on error response", async () => {
      mockApiClient.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad request"),
      });

      await expect(publishLegalVersion("doc-1", "Content", "Summary", true)).rejects.toThrow(
        "Failed to publish version",
      );
    });
  });

  describe("getLegalAcceptanceCount", () => {
    it("should call admin endpoint and return count", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: 42 }),
      });

      const result = await getLegalAcceptanceCount("doc-1");
      expect(result).toBe(42);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("getLegalAcceptanceCount"),
      );
    });

    it("should throw on error response", async () => {
      mockApiClient.mockResolvedValue({ ok: false, status: 500 });
      await expect(getLegalAcceptanceCount("doc-1")).rejects.toThrow();
    });
  });

  describe("getCurrentLegalVersion", () => {
    it("should call public legal endpoint", async () => {
      const mockVersion = { ID: "v1", version: 1, content: "Legal text" };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockVersion),
      });

      const result = await getCurrentLegalVersion("cgu");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("getCurrentVersion(documentKey='cgu')"),
      );
      expect(result).toEqual(mockVersion);
    });

    it("should throw on error response", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });
      await expect(getCurrentLegalVersion("unknown")).rejects.toThrow();
    });
  });

  describe("checkLegalAcceptance", () => {
    it("should return pending documents", async () => {
      const mockPending = [{ documentId: "doc-1", documentKey: "cgu", version: 2 }];
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: mockPending }),
      });

      const result = await checkLegalAcceptance();
      expect(result).toEqual(mockPending);
      expect(mockApiClient).toHaveBeenCalledWith(expect.stringContaining("checkLegalAcceptance"));
    });
  });

  describe("acceptLegalDocument", () => {
    it("should call legal endpoint with correct payload", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, message: "Accepted" }),
      });

      const result = await acceptLegalDocument("doc-1", 2);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/legal/acceptLegalDocument"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ documentId: "doc-1", version: 2 }),
        }),
      );
      expect(result).toEqual({ success: true, message: "Accepted" });
    });

    it("should throw on error response", async () => {
      mockApiClient.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad request"),
      });

      await expect(acceptLegalDocument("doc-1", 0)).rejects.toThrow();
    });
  });
});
