"use client";

import { useFeatureConfigStore } from "@/stores/feature-config-store";

/**
 * Hook to check if a specific feature is enabled.
 * Reads from the feature config store (populated from config cache API).
 */
export function useFeatureFlag(featureCode: string): boolean {
  const feature = useFeatureConfigStore((s) => s.getFeature(featureCode));
  return feature?.isActive ?? false;
}
