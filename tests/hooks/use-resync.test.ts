import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const mockApiClient = vi.fn();
vi.mock("@/lib/auth/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

import { useResync } from "@/hooks/use-resync";

describe("useResync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start in idle state", () => {
    const { result } = renderHook(() => useResync());
    expect(result.current.state).toBe("idle");
    expect(result.current.availableAdapters).toEqual([]);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  describe("checkAvailability", () => {
    it("should transition to available when adapters are available", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listingId: "test-listing",
            hasResyncableFields: true,
            availableAdapters: JSON.stringify([
              {
                adapterInterface: "IEmissionAdapter",
                providerKey: "IEmissionAdapter",
                isAvailable: true,
                certifiableFields: ["co2GKm", "energyClass"],
              },
            ]),
          }),
      });

      const { result } = renderHook(() => useResync());

      await act(async () => {
        await result.current.checkAvailability("test-listing");
      });

      expect(result.current.state).toBe("available");
      expect(result.current.availableAdapters).toHaveLength(1);
      expect(result.current.availableAdapters[0].adapterInterface).toBe("IEmissionAdapter");
    });

    it("should remain idle when no adapters are available", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listingId: "test-listing",
            hasResyncableFields: false,
            availableAdapters: JSON.stringify([
              {
                adapterInterface: "IEmissionAdapter",
                providerKey: "IEmissionAdapter",
                isAvailable: false,
                certifiableFields: ["co2GKm"],
              },
            ]),
          }),
      });

      const { result } = renderHook(() => useResync());

      await act(async () => {
        await result.current.checkAvailability("test-listing");
      });

      expect(result.current.state).toBe("idle");
    });

    it("should handle error response", async () => {
      mockApiClient.mockResolvedValue({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            error: { message: "Annonce non trouvee" },
          }),
      });

      const { result } = renderHook(() => useResync());

      await act(async () => {
        await result.current.checkAvailability("bad-id");
      });

      expect(result.current.state).toBe("error");
      expect(result.current.error).toBe("Annonce non trouvee");
    });

    it("should handle network error", async () => {
      mockApiClient.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useResync());

      await act(async () => {
        await result.current.checkAvailability("test-listing");
      });

      expect(result.current.state).toBe("error");
      expect(result.current.error).toBe("Network error");
    });
  });

  describe("resync", () => {
    it("should transition to done on successful resync", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listingId: "test-listing",
            success: true,
            updatedFields: JSON.stringify([
              { fieldName: "co2GKm", fieldValue: "128" },
              { fieldName: "energyClass", fieldValue: "C" },
            ]),
            failedAdapters: JSON.stringify([]),
            newVisibilityScore: 80,
          }),
      });

      const { result } = renderHook(() => useResync());

      await act(async () => {
        await result.current.resync("test-listing", ["IEmissionAdapter"]);
      });

      expect(result.current.state).toBe("done");
      expect(result.current.result).toEqual({
        success: true,
        updatedFieldCount: 2,
        failedAdapters: [],
      });
    });

    it("should report partially failed resync", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            listingId: "test-listing",
            success: true,
            updatedFields: JSON.stringify([{ fieldName: "co2GKm", fieldValue: "128" }]),
            failedAdapters: JSON.stringify(["IRecallAdapter"]),
            newVisibilityScore: 70,
          }),
      });

      const { result } = renderHook(() => useResync());

      await act(async () => {
        await result.current.resync("test-listing", ["IEmissionAdapter", "IRecallAdapter"]);
      });

      expect(result.current.state).toBe("done");
      expect(result.current.result?.failedAdapters).toContain("IRecallAdapter");
    });

    it("should handle resync error", async () => {
      mockApiClient.mockRejectedValue(new Error("Timeout"));

      const { result } = renderHook(() => useResync());

      await act(async () => {
        await result.current.resync("test-listing", ["IEmissionAdapter"]);
      });

      expect(result.current.state).toBe("error");
      expect(result.current.error).toBe("Timeout");
    });
  });

  describe("reset", () => {
    it("should reset all state", async () => {
      mockApiClient.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            availableAdapters: JSON.stringify([
              {
                adapterInterface: "IEmissionAdapter",
                isAvailable: true,
                certifiableFields: ["co2GKm"],
              },
            ]),
          }),
      });

      const { result } = renderHook(() => useResync());

      await act(async () => {
        await result.current.checkAvailability("test-listing");
      });

      expect(result.current.state).toBe("available");

      act(() => {
        result.current.reset();
      });

      expect(result.current.state).toBe("idle");
      expect(result.current.availableAdapters).toEqual([]);
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
