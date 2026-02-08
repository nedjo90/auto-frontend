import { describe, it, expect, beforeEach } from "vitest";
import { useFeatureConfigStore } from "@/stores/feature-config-store";
import type { IConfigFeature } from "@auto/shared";

const mockFeatures: IConfigFeature[] = [
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
  {
    ID: "f3",
    code: "admin.dashboard",
    name: "Administration",
    requiresAuth: true,
    requiredRole_code: "administrator",
    isActive: false,
  },
];

describe("useFeatureConfigStore", () => {
  beforeEach(() => {
    useFeatureConfigStore.setState({
      features: [],
      isLoaded: false,
    });
  });

  it("initializes with empty features and isLoaded false", () => {
    const state = useFeatureConfigStore.getState();
    expect(state.features).toEqual([]);
    expect(state.isLoaded).toBe(false);
  });

  it("setFeatures updates features and marks as loaded", () => {
    useFeatureConfigStore.getState().setFeatures(mockFeatures);
    const state = useFeatureConfigStore.getState();
    expect(state.features).toEqual(mockFeatures);
    expect(state.isLoaded).toBe(true);
  });

  it("isFeatureAuthRequired returns true for auth-required feature", () => {
    useFeatureConfigStore.getState().setFeatures(mockFeatures);
    const result = useFeatureConfigStore.getState().isFeatureAuthRequired("favorites");
    expect(result).toBe(true);
  });

  it("isFeatureAuthRequired returns false for unknown feature", () => {
    useFeatureConfigStore.getState().setFeatures(mockFeatures);
    const result = useFeatureConfigStore.getState().isFeatureAuthRequired("unknown");
    expect(result).toBe(false);
  });

  it("isFeatureAuthRequired returns false for inactive feature", () => {
    useFeatureConfigStore.getState().setFeatures(mockFeatures);
    const result = useFeatureConfigStore.getState().isFeatureAuthRequired("admin.dashboard");
    expect(result).toBe(false);
  });

  it("getFeature returns the feature by code", () => {
    useFeatureConfigStore.getState().setFeatures(mockFeatures);
    const feature = useFeatureConfigStore.getState().getFeature("messaging");
    expect(feature).toEqual(mockFeatures[1]);
  });

  it("getFeature returns undefined for unknown code", () => {
    useFeatureConfigStore.getState().setFeatures(mockFeatures);
    const feature = useFeatureConfigStore.getState().getFeature("nonexistent");
    expect(feature).toBeUndefined();
  });
});
