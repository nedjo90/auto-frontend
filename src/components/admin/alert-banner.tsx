"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, XCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchActiveAlerts, acknowledgeAlert } from "@/lib/api/alerts-api";
import { useSignalR } from "@/hooks/use-signalr";
import type { IAlertEvent } from "@auto/shared";

const SEVERITY_STYLES: Record<string, string> = {
  critical:
    "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
  warning:
    "border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100",
  info: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
};

const SEVERITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function AlertBanner() {
  const [alerts, setAlerts] = useState<IAlertEvent[]>([]);
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await fetchActiveAlerts();
      setAlerts(data);
    } catch {
      // Silently fail - dashboard should still be usable without alerts
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Listen for real-time alert events
  const handleNewAlert = useCallback((data: unknown) => {
    const payload = data as {
      alertEventId: string;
      metric: string;
      currentValue: number;
      thresholdValue: number;
      severity: string;
      message: string;
      timestamp: string;
    };
    if (!payload?.alertEventId) return;

    const newEvent: IAlertEvent = {
      ID: payload.alertEventId,
      alertId: "",
      metric: payload.metric,
      currentValue: payload.currentValue,
      thresholdValue: payload.thresholdValue,
      severity: payload.severity as IAlertEvent["severity"],
      message: payload.message,
      acknowledged: false,
      acknowledgedBy: null,
      acknowledgedAt: null,
      createdAt: payload.timestamp || new Date().toISOString(),
    };

    setAlerts((prev) => {
      if (prev.some((a) => a.ID === newEvent.ID)) return prev;
      return [newEvent, ...prev];
    });
  }, []);

  useSignalR({
    hubPath: "admin",
    events: { newAlert: handleNewAlert },
  });

  const handleAcknowledge = async (alertId: string) => {
    try {
      setAcknowledging(alertId);
      await acknowledgeAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.ID !== alertId));
    } catch {
      // Keep alert visible if acknowledge fails
    } finally {
      setAcknowledging(null);
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2" data-testid="alert-banner">
      {alerts.map((alert) => {
        const Icon = SEVERITY_ICONS[alert.severity] || Info;
        return (
          <div
            key={alert.ID}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3",
              SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info,
            )}
            data-testid={`alert-banner-item-${alert.ID}`}
          >
            <Icon className="size-5 shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-medium">{alert.message}</span>
              <span className="ml-2 text-xs opacity-70">
                {new Date(alert.createdAt).toLocaleString("fr-FR")}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAcknowledge(alert.ID)}
              disabled={acknowledging === alert.ID}
              data-testid={`alert-ack-${alert.ID}`}
            >
              <Check className="mr-1 size-3" />
              Acquitter
            </Button>
          </div>
        );
      })}
    </div>
  );
}
