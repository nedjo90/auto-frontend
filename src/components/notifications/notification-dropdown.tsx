"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { INotification } from "@auto/shared";
import { getNotifications, markNotificationsRead } from "@/lib/api/favorites-api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  onClose: () => void;
  onRead: () => void;
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "à l'instant";
  if (diffMins < 60) return `il y a ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/**
 * Dropdown showing recent notifications with mark-as-read functionality.
 */
export function NotificationDropdown({ onClose, onRead }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getNotifications({ top: 10 });
      setNotifications(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markNotificationsRead("all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      onRead();
    } catch {
      // Silently fail
    }
  }, [onRead]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-background shadow-lg sm:w-96"
      data-testid="notification-dropdown"
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} data-testid="mark-all-read">
            <Check className="mr-1 h-3.5 w-3.5" />
            Tout lire
          </Button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto" data-testid="notification-list">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="py-8 text-center text-sm text-muted-foreground"
            data-testid="notification-empty"
          >
            Aucune notification
          </div>
        ) : (
          notifications.map((notif) => (
            <Link
              key={notif.ID}
              href={`/listing/${notif.listingId}`}
              onClick={onClose}
              className={cn(
                "flex items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/50 last:border-0",
                !notif.isRead && "bg-blue-50/50 dark:bg-blue-950/20",
              )}
              data-testid={`notification-item-${notif.ID}`}
            >
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", !notif.isRead && "font-medium")}>{notif.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatTimeAgo(notif.createdAt)}
                </p>
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
