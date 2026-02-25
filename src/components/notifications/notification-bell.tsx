"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationDropdown } from "./notification-dropdown";

/**
 * Bell icon in the header with unread notification count badge.
 * Uses SignalR for real-time updates instead of polling.
 */
export function NotificationBell() {
  const { isAuthenticated } = useCurrentUser();
  const { unreadCount, notifications, markAllAsRead, refresh } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

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
          notifications={notifications}
          unreadCount={unreadCount}
          onClose={() => setIsOpen(false)}
          onMarkAllRead={markAllAsRead}
          onRefresh={refresh}
        />
      )}
    </div>
  );
}
