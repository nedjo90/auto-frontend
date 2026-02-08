"use client";

import { useEffect, useState } from "react";
import { useFeatureConfigStore } from "@/stores/feature-config-store";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function useFeatureConfig() {
  const isLoaded = useFeatureConfigStore((s) => s.isLoaded);
  const setFeatures = useFeatureConfigStore((s) => s.setFeatures);
  const isFeatureAuthRequired = useFeatureConfigStore((s) => s.isFeatureAuthRequired);
  const [error, setError] = useState<string | null>(null);

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
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Feature config load failed");
      });
  }, [isLoaded, setFeatures]);

  return {
    isFeatureAuthRequired,
    isLoaded,
    error,
  };
}
