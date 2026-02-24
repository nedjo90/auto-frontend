"use client";

import { useEffect } from "react";
import { useConsentStore } from "@/stores/consent-store";
import { getAuthHeaders } from "@/lib/auth/get-auth-headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function usePendingConsents(userId: string | null) {
  const setPendingConsents = useConsentStore((s) => s.setPendingConsents);

  useEffect(() => {
    if (!userId) return;

    const encodedUserId = encodeURIComponent(userId);
    getAuthHeaders()
      .then((authHeaders) =>
        fetch(`${API_BASE}/api/consent/getPendingConsents(userId='${encodedUserId}')`, {
          headers: { ...authHeaders },
        }),
      )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch pending consents");
        return res.json();
      })
      .then((data) => {
        setPendingConsents(data.value ?? data);
      })
      .catch(() => {
        // Silently fail — non-blocking for app functionality
      });
  }, [userId, setPendingConsents]);
}
