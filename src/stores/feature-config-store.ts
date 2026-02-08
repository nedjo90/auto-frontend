import { create } from "zustand";
import type { IConfigFeature } from "@auto/shared";

interface FeatureConfigState {
  features: IConfigFeature[];
  isLoaded: boolean;
  setFeatures: (features: IConfigFeature[]) => void;
  isFeatureAuthRequired: (featureCode: string) => boolean;
  getFeature: (featureCode: string) => IConfigFeature | undefined;
}

export const useFeatureConfigStore = create<FeatureConfigState>((set, get) => ({
  features: [],
  isLoaded: false,

  setFeatures: (features) => set({ features, isLoaded: true }),

  isFeatureAuthRequired: (featureCode) => {
    const feature = get().features.find((f) => f.code === featureCode && f.isActive);
    return feature?.requiresAuth ?? false;
  },

  getFeature: (featureCode) => {
    return get().features.find((f) => f.code === featureCode);
  },
}));
