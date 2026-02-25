import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useCurrentUser } from "@/hooks/use-current-user";

// Mock dependencies
vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: vi.fn(() => ({
    isAuthenticated: true,
    userId: "user-1",
    displayName: "Test User",
    email: "test@test.com",
  })),
}));

const mockMarkAllAsRead = vi.fn();
const mockRefresh = vi.fn();
const mockUseNotifications = vi.fn();

vi.mock("@/hooks/use-notifications", () => ({
  useNotifications: (...args: unknown[]) => mockUseNotifications(...args),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockUseCurrentUser = useCurrentUser as ReturnType<typeof vi.fn>;

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentUser.mockReturnValue({
      isAuthenticated: true,
      userId: "user-1",
      displayName: "Test User",
      email: "test@test.com",
    });
    mockUseNotifications.mockReturnValue({
      unreadCount: 0,
      notifications: [],
      markAllAsRead: mockMarkAllAsRead,
      refresh: mockRefresh,
      connectionStatus: "connected",
      hasMore: false,
      total: 0,
      markAsRead: vi.fn(),
    });
  });

  it("should render the bell icon", () => {
    render(<NotificationBell />);
    expect(screen.getByTestId("notification-bell")).toBeInTheDocument();
  });

  it("should not render when not authenticated", () => {
    mockUseCurrentUser.mockReturnValue({
      isAuthenticated: false,
      userId: null,
      displayName: null,
      email: null,
    });

    const { container } = render(<NotificationBell />);
    expect(container.innerHTML).toBe("");
  });

  it("should show unread count badge", () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: 5,
      notifications: [],
      markAllAsRead: mockMarkAllAsRead,
      refresh: mockRefresh,
      connectionStatus: "connected",
      hasMore: false,
      total: 0,
      markAsRead: vi.fn(),
    });

    render(<NotificationBell />);
    expect(screen.getByTestId("notification-badge")).toHaveTextContent("5");
  });

  it("should show 9+ for large counts", () => {
    mockUseNotifications.mockReturnValue({
      unreadCount: 15,
      notifications: [],
      markAllAsRead: mockMarkAllAsRead,
      refresh: mockRefresh,
      connectionStatus: "connected",
      hasMore: false,
      total: 0,
      markAsRead: vi.fn(),
    });

    render(<NotificationBell />);
    expect(screen.getByTestId("notification-badge")).toHaveTextContent("9+");
  });

  it("should not show badge when no unread", () => {
    render(<NotificationBell />);
    expect(screen.queryByTestId("notification-badge")).not.toBeInTheDocument();
  });

  it("should open dropdown on click", async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByTestId("notification-bell"));

    await waitFor(() => {
      expect(screen.getByTestId("notification-dropdown")).toBeInTheDocument();
    });
  });
});
