import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveDraft,
  loadDraft,
  duplicateDraft,
  deleteDraft,
  fetchSellerDrafts,
} from "@/lib/api/draft-api";

// Mock apiClient
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from "@/lib/auth/api-client";

const mockApiClient = vi.mocked(apiClient);

describe("draft-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveDraft", () => {
    it("should call saveDraft endpoint with correct payload", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listingId: "new-id",
            success: true,
            completionPercentage: 25,
            visibilityScore: 30,
            visibilityLabel: "Partiellement documenté",
          }),
      } as Response);

      const result = await saveDraft({
        fields: { make: "Renault", price: 15000 },
      });

      expect(mockApiClient).toHaveBeenCalledWith("/api/seller/saveDraft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: null,
          fields: JSON.stringify({ make: "Renault", price: 15000 }),
          certifiedFields: null,
        }),
      });
      expect(result.listingId).toBe("new-id");
      expect(result.success).toBe(true);
    });

    it("should pass listingId when updating existing draft", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listingId: "existing-id",
            success: true,
            completionPercentage: 50,
            visibilityScore: 60,
            visibilityLabel: "Bon",
          }),
      } as Response);

      await saveDraft({
        listingId: "existing-id",
        fields: { make: "Peugeot" },
      });

      const callBody = JSON.parse(mockApiClient.mock.calls[0][1]?.body as string);
      expect(callBody.listingId).toBe("existing-id");
    });

    it("should include certified fields when provided", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listingId: "id",
            success: true,
            completionPercentage: 50,
            visibilityScore: 60,
            visibilityLabel: "Bon",
          }),
      } as Response);

      const certifiedFields = [
        {
          fieldName: "make",
          fieldValue: "Renault",
          source: "SIV",
          sourceTimestamp: "2026-01-01T00:00:00Z",
          isCertified: true,
        },
      ];

      await saveDraft({
        fields: { make: "Renault" },
        certifiedFields,
      });

      const callBody = JSON.parse(mockApiClient.mock.calls[0][1]?.body as string);
      expect(callBody.certifiedFields).toBe(JSON.stringify(certifiedFields));
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server error"),
      } as Response);

      await expect(saveDraft({ fields: {} })).rejects.toThrow("Save draft failed: 500");
    });
  });

  describe("loadDraft", () => {
    it("should call loadDraft endpoint with listingId", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listing: "{}",
            certifiedFields: "[]",
            photos: "[]",
          }),
      } as Response);

      const result = await loadDraft("listing-123");
      expect(mockApiClient).toHaveBeenCalledWith("/api/seller/loadDraft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: "listing-123" }),
      });
      expect(result.listing).toBe("{}");
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not found"),
      } as Response);

      await expect(loadDraft("bad-id")).rejects.toThrow("Load draft failed: 404");
    });
  });

  describe("duplicateDraft", () => {
    it("should call duplicateDraft endpoint", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ listingId: "new-dup-id", success: true }),
      } as Response);

      const result = await duplicateDraft("original-id");
      expect(result.listingId).toBe("new-dup-id");
      expect(result.success).toBe(true);
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValue({
        ok: false,
        status: 403,
        text: () => Promise.resolve("Forbidden"),
      } as Response);

      await expect(duplicateDraft("id")).rejects.toThrow("Duplicate draft failed: 403");
    });
  });

  describe("deleteDraft", () => {
    it("should call deleteDraft endpoint", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, message: "Deleted" }),
      } as Response);

      const result = await deleteDraft("listing-123");
      expect(result.success).toBe(true);
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad request"),
      } as Response);

      await expect(deleteDraft("id")).rejects.toThrow("Delete draft failed: 400");
    });
  });

  describe("fetchSellerDrafts", () => {
    it("should fetch drafts with correct OData filter", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ value: [{ ID: "1" }, { ID: "2" }] }),
      } as Response);

      const result = await fetchSellerDrafts();
      expect(mockApiClient).toHaveBeenCalledWith(
        "/api/seller/Listings?$filter=status eq 'draft'&$orderby=modifiedAt desc",
      );
      expect(result.value).toHaveLength(2);
    });

    it("should throw on non-ok response", async () => {
      mockApiClient.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(fetchSellerDrafts()).rejects.toThrow("Failed to fetch drafts: 500");
    });
  });
});
