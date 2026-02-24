import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  markAsSold,
  archiveListing,
  getSellerListings,
  getListingHistory,
  getPublicListing,
} from "@/lib/api/lifecycle-api";

const mockFetch = vi.fn();

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockFetch(...args),
}));

describe("lifecycle-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("markAsSold", () => {
    it("should call the correct endpoint", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, listingId: "id-1", newStatus: "sold", timestamp: "t" }),
      });

      const result = await markAsSold("id-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/seller/markAsSold"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result.success).toBe(true);
      expect(result.newStatus).toBe("sold");
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad request"),
      });

      await expect(markAsSold("id-1")).rejects.toThrow("Failed to mark listing as sold");
    });
  });

  describe("archiveListing", () => {
    it("should call the correct endpoint", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            listingId: "id-1",
            newStatus: "archived",
            timestamp: "t",
          }),
      });

      const result = await archiveListing("id-1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/seller/archiveListing"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result.success).toBe(true);
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        text: () => Promise.resolve("Forbidden"),
      });

      await expect(archiveListing("id-1")).rejects.toThrow("Failed to archive listing");
    });
  });

  describe("getSellerListings", () => {
    it("should parse JSON string response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listings: JSON.stringify([{ ID: "id-1", make: "Renault" }]),
          }),
      });

      const result = await getSellerListings();
      expect(result).toHaveLength(1);
      expect(result[0].ID).toBe("id-1");
    });

    it("should handle already-parsed array response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ listings: [{ ID: "id-1" }] }),
      });

      const result = await getSellerListings();
      expect(result).toHaveLength(1);
    });

    it("should return empty array on no listings", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ listings: "[]" }),
      });

      const result = await getSellerListings();
      expect(result).toHaveLength(0);
    });
  });

  describe("getListingHistory", () => {
    it("should parse history response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listings: JSON.stringify([
              { ID: "id-1", status: "sold" },
              { ID: "id-2", status: "archived" },
            ]),
          }),
      });

      const result = await getListingHistory();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe("sold");
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server error"),
      });

      await expect(getListingHistory()).rejects.toThrow("Failed to fetch listing history");
    });
  });

  describe("getPublicListing", () => {
    it("should fetch listing by ID", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            ID: "id-1",
            make: "Renault",
            status: "published",
          }),
      });

      const result = await getPublicListing("id-1");
      expect(result).not.toBeNull();
      expect(result?.ID).toBe("id-1");
    });

    it("should return null on 404", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not found"),
      });

      const result = await getPublicListing("nonexistent");
      expect(result).toBeNull();
    });

    it("should throw on other errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Server error"),
      });

      await expect(getPublicListing("id-1")).rejects.toThrow("Failed to fetch listing");
    });
  });
});
