import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { INotification } from "@auto/shared";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const baseNotification: INotification = {
  ID: "notif-1",
  userId: "user-1",
  type: "price_change",
  title: "Changement de prix",
  body: "Le prix du Renault Clio a baissé de 15000€ à 14000€",
  message: "Le prix du Renault Clio a baissé de 15000€ à 14000€",
  actionUrl: "/listing/listing-1",
  listingId: "listing-1",
  isRead: false,
  createdAt: new Date().toISOString(),
};

describe("NotificationDropdown", () => {
  const mockOnClose = vi.fn();
  const mockOnMarkAllRead = vi.fn();
  const mockOnRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render empty state", () => {
    render(
      <NotificationDropdown
        notifications={[]}
        unreadCount={0}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByTestId("notification-empty")).toHaveTextContent("Aucune notification");
  });

  it("should render notifications with title and body", () => {
    render(
      <NotificationDropdown
        notifications={[baseNotification]}
        unreadCount={1}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText("Changement de prix")).toBeInTheDocument();
    expect(screen.getByText(/baissé/)).toBeInTheDocument();
  });

  it("should show mark all read button when there are unread notifications", () => {
    render(
      <NotificationDropdown
        notifications={[baseNotification]}
        unreadCount={1}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByTestId("mark-all-read")).toBeInTheDocument();
  });

  it("should not show mark all read button when all read", () => {
    render(
      <NotificationDropdown
        notifications={[{ ...baseNotification, isRead: true }]}
        unreadCount={0}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.queryByTestId("mark-all-read")).not.toBeInTheDocument();
  });

  it("should call onMarkAllRead when button clicked", () => {
    render(
      <NotificationDropdown
        notifications={[baseNotification]}
        unreadCount={1}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    fireEvent.click(screen.getByTestId("mark-all-read"));
    expect(mockOnMarkAllRead).toHaveBeenCalled();
  });

  it("should use actionUrl for notification link", () => {
    render(
      <NotificationDropdown
        notifications={[baseNotification]}
        unreadCount={1}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    const link = screen.getByTestId("notification-item-notif-1");
    expect(link).toHaveAttribute("href", "/listing/listing-1");
  });

  it("should fall back to listing URL when no actionUrl", () => {
    const notif: INotification = {
      ...baseNotification,
      actionUrl: null,
      listingId: "listing-99",
    };

    render(
      <NotificationDropdown
        notifications={[notif]}
        unreadCount={1}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    const link = screen.getByTestId("notification-item-notif-1");
    expect(link).toHaveAttribute("href", "/listing/listing-99");
  });

  it("should highlight unread notifications", () => {
    const notifications: INotification[] = [
      baseNotification,
      { ...baseNotification, ID: "notif-2", isRead: true },
    ];

    render(
      <NotificationDropdown
        notifications={notifications}
        unreadCount={1}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    const unread = screen.getByTestId("notification-item-notif-1");
    const read = screen.getByTestId("notification-item-notif-2");
    expect(unread.className).toContain("bg-blue");
    expect(read.className).not.toContain("bg-blue");
  });

  it("should show settings link", () => {
    render(
      <NotificationDropdown
        notifications={[baseNotification]}
        unreadCount={1}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(screen.getByText("Gérer les notifications")).toBeInTheDocument();
  });

  it("should call onRefresh on mount", () => {
    render(
      <NotificationDropdown
        notifications={[]}
        unreadCount={0}
        onClose={mockOnClose}
        onMarkAllRead={mockOnMarkAllRead}
        onRefresh={mockOnRefresh}
      />,
    );

    expect(mockOnRefresh).toHaveBeenCalled();
  });
});
