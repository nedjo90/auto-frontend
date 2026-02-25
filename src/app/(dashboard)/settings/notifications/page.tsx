"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2, Smartphone, Trash2 } from "lucide-react";
import type { INotificationPreference, IPushSubscription } from "@auto/shared";
import { NOTIFICATION_TYPE_LABELS } from "@auto/shared";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  getNotificationPreferences,
  updateNotificationPreference,
  getPushSubscriptions,
  registerPushSubscription,
  unregisterPushSubscription,
} from "@/lib/api/notifications-api";

export default function NotificationSettingsPage() {
  const { isAuthenticated } = useCurrentUser();
  const [preferences, setPreferences] = useState<INotificationPreference[]>([]);
  const [subscriptions, setSubscriptions] = useState<IPushSubscription[]>([]);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [updatingType, setUpdatingType] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<"idle" | "requesting" | "granted" | "denied">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    try {
      setLoadingPrefs(true);
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch {
      setError("Impossible de charger les préférences");
    } finally {
      setLoadingPrefs(false);
    }
  }, []);

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoadingSubs(true);
      const subs = await getPushSubscriptions();
      setSubscriptions(subs);
    } catch {
      // Non-critical
    } finally {
      setLoadingSubs(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadPreferences();
    loadSubscriptions();

    // Check current push permission
    if (typeof Notification !== "undefined") {
      if (Notification.permission === "granted") {
        setPushStatus("granted");
      } else if (Notification.permission === "denied") {
        setPushStatus("denied");
      }
    }
  }, [isAuthenticated, loadPreferences, loadSubscriptions]);

  const handleTogglePreference = useCallback(async (type: string, enabled: boolean) => {
    setUpdatingType(type);
    setError(null);
    try {
      await updateNotificationPreference(type, enabled);
      setPreferences((prev) => prev.map((p) => (p.type === type ? { ...p, enabled } : p)));
    } catch {
      setError("Impossible de mettre à jour la préférence");
    } finally {
      setUpdatingType(null);
    }
  }, []);

  const handleEnablePush = useCallback(async () => {
    if (typeof Notification === "undefined") return;

    setPushStatus("requesting");
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPushStatus("granted");

        // Register service worker push subscription
        const registration = await navigator.serviceWorker?.ready;
        if (registration) {
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (vapidKey) {
            const sub = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: vapidKey,
            });
            const json = sub.toJSON();
            if (json.endpoint && json.keys) {
              await registerPushSubscription({
                endpoint: json.endpoint,
                p256dhKey: json.keys.p256dh || "",
                authKey: json.keys.auth || "",
                deviceLabel: navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop",
              });
              await loadSubscriptions();
            }
          }
        }
      } else {
        setPushStatus("denied");
      }
    } catch {
      setPushStatus("idle");
    }
  }, [loadSubscriptions]);

  const handleRemoveSubscription = useCallback(async (subscriptionId: string) => {
    try {
      await unregisterPushSubscription(subscriptionId);
      setSubscriptions((prev) => prev.filter((s) => s.ID !== subscriptionId));
    } catch {
      setError("Impossible de supprimer la souscription");
    }
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6" />
        <h1 className="text-xl font-bold sm:text-2xl">Paramètres de notifications</h1>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Notification Preferences */}
      <Card className="p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold">Types de notifications</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Choisissez les notifications que vous souhaitez recevoir.
        </p>

        {loadingPrefs ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4" data-testid="notification-preferences">
            {preferences.map((pref) => (
              <div
                key={pref.type}
                className="flex items-center justify-between gap-4"
                data-testid={`pref-${pref.type}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {NOTIFICATION_TYPE_LABELS[pref.type] || pref.type}
                  </p>
                </div>
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={(checked) => handleTogglePreference(pref.type, checked)}
                  disabled={updatingType === pref.type}
                  data-testid={`pref-switch-${pref.type}`}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Push Notifications */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications push</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Recevez des notifications même lorsque vous n&apos;êtes pas sur le site.
        </p>

        {pushStatus === "denied" ? (
          <p className="text-sm text-muted-foreground" data-testid="push-denied">
            Les notifications push sont bloquées par votre navigateur. Veuillez les réactiver dans
            les paramètres de votre navigateur.
          </p>
        ) : pushStatus === "granted" ? (
          <div className="space-y-4">
            <p className="text-sm text-green-600" data-testid="push-enabled">
              Notifications push activées
            </p>

            {loadingSubs ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : subscriptions.length > 0 ? (
              <div className="space-y-2" data-testid="push-subscriptions">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.ID}
                    className="flex items-center justify-between rounded-md border p-3"
                    data-testid={`push-sub-${sub.ID}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{sub.deviceLabel || "Appareil inconnu"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {sub.endpoint.slice(0, 60)}...
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSubscription(sub.ID)}
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Button variant="outline" onClick={handleEnablePush} data-testid="register-push">
                Enregistrer cet appareil
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={handleEnablePush}
            disabled={pushStatus === "requesting"}
            data-testid="enable-push"
          >
            {pushStatus === "requesting" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Activer les notifications push
          </Button>
        )}
      </Card>
    </div>
  );
}
