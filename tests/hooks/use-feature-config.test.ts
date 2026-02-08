import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { useFeatureConfigStore } from "@/stores/feature-config-store";
import type { IConfigFeature } from "@auto/shared";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Must import after mocks
import { useFeatureConfig } from "@/hooks/use-feature-config";

const mockFeaturesResponse = {
  value: [
    {
      ID: "f1",
      code: "favorites",
      name: "Favoris",
      requiresAuth: true,
      requiredRole_code: null,
      isActive: true,
    },
    {
      ID: "f2",
      code: "messaging",
      name: "Messagerie",
      requiresAuth: true,
      requiredRole_code: "buyer",
      isActive: true,
    },
  ],
};

describe("useFeatureConfig", () => {
  beforeEach(() => {
    cleanup();
    mockFetch.mockReset();
    useFeatureConfigStore.setState({
      features: [],
      isLoaded: false,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("fetches features from backend and populates store", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockFeaturesResponse),
    });

    renderHook(() => useFeatureConfig());

    await waitFor(() => {
      const state = useFeatureConfigStore.getState();
      expect(state.isLoaded).toBe(true);
      expect(state.features).toHaveLength(2);
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/rbac/ConfigFeatures"));
  });

  it("does not fetch again if already loaded", () => {
    useFeatureConfigStore.setState({
      features: mockFeaturesResponse.value as IConfigFeature[],
      isLoaded: true,
    });

    renderHook(() => useFeatureConfig());

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns isFeatureAuthRequired from store", () => {
    useFeatureConfigStore.setState({
      features: mockFeaturesResponse.value as IConfigFeature[],
      isLoaded: true,
    });

    const { result } = renderHook(() => useFeatureConfig());

    expect(result.current.isFeatureAuthRequired("favorites")).toBe(true);
    expect(result.current.isFeatureAuthRequired("unknown")).toBe(false);
  });

  it("handles fetch error and exposes error state", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useFeatureConfig());

    await waitFor(() => {
      expect(result.current.error).toBe("Failed to fetch feature config");
    });

    const state = useFeatureConfigStore.getState();
    expect(state.features).toEqual([]);
  });

  it("handles network error and exposes error state", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useFeatureConfig());

    await waitFor(() => {
      expect(result.current.error).toBe("Network error");
    });

    const state = useFeatureConfigStore.getState();
    expect(state.features).toEqual([]);
  });
});
