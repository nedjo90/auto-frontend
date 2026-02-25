"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getUnreadCount } from "@/lib/api/favorites-api";
import { NotificationDropdown } from "./notification-dropdown";

/**
 * Bell icon in the header with unread notification count badge.
 * Opens a dropdown with recent notifications.
 */
export function NotificationBell() {
  const { isAuthenticated } = useCurrentUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const setCountRef = useRef(setUnreadCount);

  useEffect(() => {
    if (!isAuthenticated) return;

    let ignore = false;

    async function fetchCount() {
      try {
        const count = await getUnreadCount();
        if (!ignore) setCountRef.current(count);
      } catch {
        // Silently fail
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const refreshCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silently fail
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" data-testid="notification-bell-container">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        data-testid="notification-bell"
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
            data-testid="notification-badge"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          onRead={() => {
            refreshCount();
          }}
        />
      )}
    </div>
  );
}
