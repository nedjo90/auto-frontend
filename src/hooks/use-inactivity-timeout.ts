import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { logoutRedirect } from "@/lib/auth/auth-utils";

/**
 * Tracks user activity and manages inactivity timeout state.
 * The hook owns all timeout/warning logic (M5: single source of truth).
 *
 * @param timeoutMinutes - Inactivity timeout in minutes
 * @param warningMinutes - Minutes before timeout to show warning
 * @returns {{ showWarning: boolean, remainingSeconds: number }}
 */
export function useInactivityTimeout(timeoutMinutes: number, warningMinutes: number) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateLastActivity = useAuthStore((s) => s.updateLastActivity);
  const lastActivity = useAuthStore((s) => s.lastActivity);
  const logoutCalledRef = useRef(false);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // M1: Throttled activity handler — at most once per second
  const lastUpdateRef = useRef(0);
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current > 1000) {
      lastUpdateRef.current = now;
      updateLastActivity();
    }
  }, [updateLastActivity]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Initialize last activity
    updateLastActivity();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [isAuthenticated, handleActivity, updateLastActivity]);

  // Check timeout periodically (M5: single interval handles both warning and logout)
  useEffect(() => {
    if (!isAuthenticated || lastActivity === 0) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
      const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));

      if (elapsed >= timeoutMs && !logoutCalledRef.current) {
        logoutCalledRef.current = true;
        // M4: Await and catch logoutRedirect
        logoutRedirect().catch((err) => {
          console.error("[use-inactivity-timeout] Logout failed:", err);
          logoutCalledRef.current = false;
        });
        return;
      }

      if (elapsed >= warningMs) {
        setShowWarning(true);
        setRemainingSeconds(remaining);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, timeoutMinutes, warningMinutes]);

  // Reset logoutCalledRef when user becomes unauthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      logoutCalledRef.current = false;
    }
  }, [isAuthenticated]);

  return {
    showWarning,
    remainingSeconds,
    timeoutMinutes,
    warningMinutes,
  };
}
