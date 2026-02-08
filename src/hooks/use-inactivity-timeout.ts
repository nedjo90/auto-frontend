import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { logoutRedirect } from "@/lib/auth/auth-utils";

/**
 * Tracks user activity and forces logout on inactivity timeout.
 * @param timeoutMinutes - Inactivity timeout in minutes
 * @param warningMinutes - Minutes before timeout to show warning
 * @returns {{ showWarning: boolean, remainingSeconds: number }}
 */
export function useInactivityTimeout(
  timeoutMinutes: number,
  warningMinutes: number,
) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateLastActivity = useAuthStore((s) => s.updateLastActivity);
  const checkSessionTimeout = useAuthStore((s) => s.checkSessionTimeout);
  const logoutCalledRef = useRef(false);

  const handleActivity = useCallback(() => {
    updateLastActivity();
  }, [updateLastActivity]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Initialize last activity
    updateLastActivity();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
    };
  }, [isAuthenticated, handleActivity, updateLastActivity]);

  // Check timeout periodically
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (checkSessionTimeout(timeoutMinutes) && !logoutCalledRef.current) {
        logoutCalledRef.current = true;
        logoutRedirect();
      }
    }, 60_000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, timeoutMinutes, warningMinutes, checkSessionTimeout]);

  return {
    timeoutMinutes,
    warningMinutes,
  };
}
