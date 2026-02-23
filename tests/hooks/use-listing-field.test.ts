import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useListingField } from "@/hooks/use-listing-field";
import { useListingStore } from "@/stores/listing-store";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useListingField", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    useListingStore.setState({
      listingId: "listing-123",
      fields: {},
      visibilityScore: 50,
      isLoading: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("handleFieldChange", () => {
    it("should update field in store optimistically", () => {
      const { result } = renderHook(() => useListingField());

      act(() => {
        result.current.handleFieldChange("price", "15000");
      });

      const field = useListingStore.getState().fields.price;
      expect(field.value).toBe("15000");
      expect(field.status).toBe("declared");
    });

    it("should set status to empty when value is empty string", () => {
      const { result } = renderHook(() => useListingField());

      act(() => {
        result.current.handleFieldChange("price", "");
      });

      const field = useListingStore.getState().fields.price;
      expect(field.status).toBe("empty");
    });

    it("should debounce backend calls", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            fieldName: "price",
            value: "15000",
            status: "declared",
            visibilityScore: 60,
          }),
      });

      const { result } = renderHook(() => useListingField());

      act(() => {
        result.current.handleFieldChange("price", "1");
        result.current.handleFieldChange("price", "15");
        result.current.handleFieldChange("price", "150");
        result.current.handleFieldChange("price", "1500");
        result.current.handleFieldChange("price", "15000");
      });

      // Before debounce fires, no fetch
      expect(mockFetch).not.toHaveBeenCalled();

      // Fast forward debounce timer
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Only 1 fetch call (debounced)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should update visibility score from backend response", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            fieldName: "price",
            value: "15000",
            status: "declared",
            visibilityScore: 75,
          }),
      });

      const { result } = renderHook(() => useListingField());

      act(() => {
        result.current.handleFieldChange("price", "15000");
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Wait for async fetch to resolve
      await act(async () => {
        await Promise.resolve();
      });

      expect(useListingStore.getState().visibilityScore).toBe(75);
    });

    it("should handle backend errors gracefully", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: { message: "Server error" } }),
      });

      const { result } = renderHook(() => useListingField());

      act(() => {
        result.current.handleFieldChange("price", "15000");
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      await act(async () => {
        await Promise.resolve();
      });

      // Store should still have the optimistic value
      expect(useListingStore.getState().fields.price.value).toBe("15000");
    });

    it("should not call backend when no listingId", async () => {
      useListingStore.setState({ listingId: null });
      const { result } = renderHook(() => useListingField());

      act(() => {
        result.current.handleFieldChange("price", "15000");
      });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("handleCertifiedOverride", () => {
    it("should change field status from certified to declared", async () => {
      useListingStore.setState({
        listingId: "listing-123",
        fields: {
          make: {
            fieldName: "make",
            value: "Renault",
            status: "certified",
            certifiedSource: "SIV",
          },
        },
      });

      const { result } = renderHook(() => useListingField());

      await act(async () => {
        await result.current.handleCertifiedOverride("make");
      });

      const field = useListingStore.getState().fields.make;
      expect(field.status).toBe("declared");
    });

    it("should preserve original value as reference", async () => {
      useListingStore.setState({
        listingId: "listing-123",
        fields: {
          make: {
            fieldName: "make",
            value: "Renault",
            status: "certified",
            certifiedSource: "SIV",
          },
        },
      });

      const { result } = renderHook(() => useListingField());

      await act(async () => {
        await result.current.handleCertifiedOverride("make");
      });

      expect(useListingStore.getState().fields.make.originalCertifiedValue).toBe("Renault");
    });

    it("should not crash when no listingId", async () => {
      useListingStore.setState({ listingId: null });
      const { result } = renderHook(() => useListingField());

      await act(async () => {
        await result.current.handleCertifiedOverride("make");
      });

      // No error thrown
    });
  });
});
