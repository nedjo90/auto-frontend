"use client";

import { useCallback } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";
import { logoutRedirect } from "@/lib/auth/auth-utils";
import type { ISessionConfig } from "@auto/shared";

interface SessionTimeoutWarningProps extends ISessionConfig {
  showWarning: boolean;
  remainingSeconds: number;
}

/**
 * Dialog warning the user their session will expire.
 * M5: Receives state from useInactivityTimeout — no duplicate interval.
 */
export function SessionTimeoutWarning({
  showWarning,
  remainingSeconds,
}: SessionTimeoutWarningProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateLastActivity = useAuthStore((s) => s.updateLastActivity);

  const handleStayConnected = useCallback(() => {
    updateLastActivity();
  }, [updateLastActivity]);

  const handleLogout = useCallback(() => {
    logoutRedirect().catch((err) => {
      console.error("[session-timeout-warning] Logout failed:", err);
    });
  }, []);

  if (!isAuthenticated) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    // L2: onOpenChange={() => {}} prevents dismiss via Escape (intentional for security)
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="size-5 text-amber-500" />
            Session sur le point d&apos;expirer
          </DialogTitle>
          <DialogDescription>
            Votre session expirera dans{" "}
            <strong>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </strong>
            . Voulez-vous rester connecté ?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleLogout}>
            Se déconnecter
          </Button>
          <Button onClick={handleStayConnected}>Rester connecté</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
