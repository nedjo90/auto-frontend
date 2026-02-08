"use client";

import { useState, useEffect, useCallback } from "react";
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

interface SessionTimeoutWarningProps {
  timeoutMinutes: number;
  warningMinutes: number;
}

export function SessionTimeoutWarning({
  timeoutMinutes,
  warningMinutes,
}: SessionTimeoutWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const lastActivity = useAuthStore((s) => s.lastActivity);
  const updateLastActivity = useAuthStore((s) => s.updateLastActivity);

  useEffect(() => {
    if (!isAuthenticated || lastActivity === 0) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
      const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));

      if (elapsed >= timeoutMs) {
        logoutRedirect();
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

  const handleStayConnected = useCallback(() => {
    updateLastActivity();
    setShowWarning(false);
  }, [updateLastActivity]);

  if (!isAuthenticated) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
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
          <Button variant="outline" onClick={() => logoutRedirect()}>
            Se déconnecter
          </Button>
          <Button onClick={handleStayConnected}>Rester connecté</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
