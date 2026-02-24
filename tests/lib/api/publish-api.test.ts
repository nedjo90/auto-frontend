import { describe, it, expect, vi, beforeEach } from "vitest";

const mockApiClient = vi.fn();

vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import {
  getPublishableListings,
  calculateBatchTotal,
  createCheckoutSession,
  getPaymentSessionStatus,
} from "@/lib/api/publish-api";

function mockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  };
}

describe("publish-api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPublishableListings", () => {
    it("should call API and parse JSON string listings", async () => {
      const listings = [
        {
          ID: "l-1",
          make: "Renault",
          model: "Clio",
          year: 2020,
          visibilityScore: 80,
          photoCount: 3,
          declarationId: "d-1",
        },
      ];
      mockApiClient.mockResolvedValue(
        mockResponse({ listings: JSON.stringify(listings), unitPriceCents: 499 }),
      );

      const result = await getPublishableListings();
      expect(result.listings).toEqual(listings);
      expect(result.unitPriceCents).toBe(499);
      expect(mockApiClient).toHaveBeenCalledWith(
        expect.stringContaining("/api/seller/getPublishableListings"),
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("should handle already-parsed listings array", async () => {
      const listings = [
        {
          ID: "l-1",
          make: "BMW",
          model: "X3",
          year: 2019,
          visibilityScore: 70,
          photoCount: 2,
          declarationId: "d-1",
        },
      ];
      mockApiClient.mockResolvedValue(mockResponse({ listings, unitPriceCents: 499 }));

      const result = await getPublishableListings();
      expect(result.listings).toEqual(listings);
    });

    it("should throw on API error", async () => {
      mockApiClient.mockResolvedValue(mockResponse("Server error", false, 500));
      await expect(getPublishableListings()).rejects.toThrow(
        "Failed to fetch publishable listings",
      );
    });
  });

  describe("calculateBatchTotal", () => {
    it("should send listing IDs as JSON string and return parsed result", async () => {
      mockApiClient.mockResolvedValue(
        mockResponse({
          count: 2,
          unitPriceCents: 499,
          totalCents: 998,
          listingIds: JSON.stringify(["l-1", "l-2"]),
        }),
      );

      const result = await calculateBatchTotal(["l-1", "l-2"]);
      expect(result.count).toBe(2);
      expect(result.totalCents).toBe(998);
      expect(result.listingIds).toEqual(["l-1", "l-2"]);
    });

    it("should throw on API error", async () => {
      mockApiClient.mockResolvedValue(mockResponse("Bad request", false, 400));
      await expect(calculateBatchTotal(["l-1"])).rejects.toThrow("Failed to calculate batch total");
    });
  });

  describe("createCheckoutSession", () => {
    it("should send checkout request and return session result", async () => {
      mockApiClient.mockResolvedValue(
        mockResponse({
          sessionId: "cs_test_123",
          sessionUrl: "https://checkout.stripe.com/cs_test_123",
        }),
      );

      const result = await createCheckoutSession(
        ["l-1"],
        "https://example.com/success",
        "https://example.com/cancel",
      );
      expect(result.sessionId).toBe("cs_test_123");
      expect(result.sessionUrl).toBe("https://checkout.stripe.com/cs_test_123");

      const body = JSON.parse(mockApiClient.mock.calls[0][1].body);
      expect(body.listingIds).toBe(JSON.stringify(["l-1"]));
      expect(body.successUrl).toBe("https://example.com/success");
      expect(body.cancelUrl).toBe("https://example.com/cancel");
    });

    it("should throw on API error", async () => {
      mockApiClient.mockResolvedValue(mockResponse("Error", false, 500));
      await expect(
        createCheckoutSession(["l-1"], "https://a.com/s", "https://a.com/c"),
      ).rejects.toThrow("Failed to create checkout session");
    });
  });

  describe("getPaymentSessionStatus", () => {
    it("should return parsed payment status", async () => {
      mockApiClient.mockResolvedValue(
        mockResponse({
          status: "Succeeded",
          listingCount: 2,
          listings: JSON.stringify([
            { ID: "l-1", status: "published" },
            { ID: "l-2", status: "published" },
          ]),
        }),
      );

      const result = await getPaymentSessionStatus("cs_test_123");
      expect(result.status).toBe("Succeeded");
      expect(result.listingCount).toBe(2);
      expect(result.listings).toEqual([
        { ID: "l-1", status: "published" },
        { ID: "l-2", status: "published" },
      ]);
    });

    it("should handle already-parsed listings", async () => {
      mockApiClient.mockResolvedValue(
        mockResponse({
          status: "Pending",
          listingCount: 1,
          listings: [{ ID: "l-1", status: "draft" }],
        }),
      );

      const result = await getPaymentSessionStatus("cs_test_456");
      expect(result.listings).toEqual([{ ID: "l-1", status: "draft" }]);
    });

    it("should throw on API error", async () => {
      mockApiClient.mockResolvedValue(mockResponse("Not found", false, 404));
      await expect(getPaymentSessionStatus("cs_bad")).rejects.toThrow(
        "Failed to get payment status",
      );
    });
  });
});
