import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useFeatureConfigStore } from "@/stores/feature-config-store";

describe("useFeatureFlag", () => {
  beforeEach(() => {
    useFeatureConfigStore.setState({
      features: [
        {
          ID: "f1",
          code: "favorites",
          name: "Favorites",
          requiresAuth: true,
          requiredRole_code: null,
          isActive: true,
        },
        {
          ID: "f2",
          code: "chat",
          name: "Chat",
          requiresAuth: false,
          requiredRole_code: null,
          isActive: false,
        },
      ],
      isLoaded: true,
    });
  });

  it("should return true for an active feature", () => {
    const { result } = renderHook(() => useFeatureFlag("favorites"));
    expect(result.current).toBe(true);
  });

  it("should return false for an inactive feature", () => {
    const { result } = renderHook(() => useFeatureFlag("chat"));
    expect(result.current).toBe(false);
  });

  it("should return false for a non-existent feature", () => {
    const { result } = renderHook(() => useFeatureFlag("nonexistent"));
    expect(result.current).toBe(false);
  });
});
