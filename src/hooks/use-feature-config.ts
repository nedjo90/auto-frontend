"use client";

import { useEffect } from "react";
import { useFeatureConfigStore } from "@/stores/feature-config-store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function useFeatureConfig() {
  const isLoaded = useFeatureConfigStore((s) => s.isLoaded);
  const setFeatures = useFeatureConfigStore((s) => s.setFeatures);
  const isFeatureAuthRequired = useFeatureConfigStore((s) => s.isFeatureAuthRequired);

  useEffect(() => {
    if (isLoaded) return;

    fetch(`${API_BASE}/api/rbac/ConfigFeatures`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch feature config");
        return res.json();
      })
      .then((data) => {
        setFeatures(data.value ?? data);
      })
      .catch(() => {
        // Silently fail — non-blocking for app functionality
      });
  }, [isLoaded, setFeatures]);

  return {
    isFeatureAuthRequired,
    isLoaded,
  };
}
