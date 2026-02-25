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

const mockGetUnreadCount = vi.fn();
vi.mock("@/lib/api/favorites-api", () => ({
  getUnreadCount: (...args: unknown[]) => mockGetUnreadCount(...args),
  getNotifications: vi.fn().mockResolvedValue({
    items: [],
    total: 0,
    unreadCount: 0,
    hasMore: false,
  }),
  markNotificationsRead: vi.fn().mockResolvedValue({ success: true, updated: 0 }),
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
    mockGetUnreadCount.mockResolvedValue(0);
    // Restore authenticated state (may be overridden by individual tests)
    mockUseCurrentUser.mockReturnValue({
      isAuthenticated: true,
      userId: "user-1",
      displayName: "Test User",
      email: "test@test.com",
    });
  });

  it("should render the bell icon", async () => {
    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByTestId("notification-bell")).toBeInTheDocument();
    });
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

  it("should show unread count badge", async () => {
    mockGetUnreadCount.mockResolvedValue(5);

    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByTestId("notification-badge")).toHaveTextContent("5");
    });
  });

  it("should show 9+ for large counts", async () => {
    mockGetUnreadCount.mockResolvedValue(15);

    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.getByTestId("notification-badge")).toHaveTextContent("9+");
    });
  });

  it("should not show badge when no unread", async () => {
    mockGetUnreadCount.mockResolvedValue(0);

    render(<NotificationBell />);
    await waitFor(() => {
      expect(screen.queryByTestId("notification-badge")).not.toBeInTheDocument();
    });
  });

  it("should open dropdown on click", async () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByTestId("notification-bell"));

    await waitFor(() => {
      expect(screen.getByTestId("notification-dropdown")).toBeInTheDocument();
    });
  });
});
