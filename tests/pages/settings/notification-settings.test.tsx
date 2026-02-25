import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NotificationSettingsPage from "@/app/(dashboard)/settings/notifications/page";

// Mock dependencies
vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: vi.fn(() => ({
    isAuthenticated: true,
    userId: "user-1",
  })),
}));

const mockGetPreferences = vi.fn();
const mockUpdatePreference = vi.fn();
const mockGetSubs = vi.fn();
const mockRegisterSub = vi.fn();
const mockUnregisterSub = vi.fn();

vi.mock("@/lib/api/notifications-api", () => ({
  getNotificationPreferences: (...args: unknown[]) => mockGetPreferences(...args),
  updateNotificationPreference: (...args: unknown[]) => mockUpdatePreference(...args),
  getPushSubscriptions: (...args: unknown[]) => mockGetSubs(...args),
  registerPushSubscription: (...args: unknown[]) => mockRegisterSub(...args),
  unregisterPushSubscription: (...args: unknown[]) => mockUnregisterSub(...args),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("NotificationSettingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPreferences.mockResolvedValue([
      { ID: "pref-1", userId: "user-1", type: "price_change", enabled: true },
      { ID: "pref-2", userId: "user-1", type: "sold", enabled: false },
      { ID: "pref-3", userId: "user-1", type: "new_message", enabled: true },
      { ID: "pref-4", userId: "user-1", type: "new_view", enabled: true },
      { ID: "pref-5", userId: "user-1", type: "new_contact", enabled: true },
      { ID: "pref-6", userId: "user-1", type: "report_handled", enabled: true },
      { ID: "pref-7", userId: "user-1", type: "certification_update", enabled: true },
      { ID: "pref-8", userId: "user-1", type: "photos_added", enabled: true },
    ]);
    mockGetSubs.mockResolvedValue([]);
  });

  it("should render the page title", async () => {
    render(<NotificationSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Paramètres de notifications")).toBeInTheDocument();
    });
  });

  it("should load and display preferences", async () => {
    render(<NotificationSettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("notification-preferences")).toBeInTheDocument();
    });

    expect(screen.getByTestId("pref-price_change")).toBeInTheDocument();
    expect(screen.getByTestId("pref-sold")).toBeInTheDocument();
    expect(screen.getByTestId("pref-new_message")).toBeInTheDocument();
  });

  it("should display French labels for notification types", async () => {
    render(<NotificationSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Changement de prix")).toBeInTheDocument();
      expect(screen.getByText("Véhicule vendu")).toBeInTheDocument();
      expect(screen.getByText("Nouveau message")).toBeInTheDocument();
    });
  });

  it("should call updatePreference when toggling", async () => {
    mockUpdatePreference.mockResolvedValue({ success: true });
    render(<NotificationSettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("pref-switch-price_change")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("pref-switch-price_change"));

    await waitFor(() => {
      expect(mockUpdatePreference).toHaveBeenCalledWith("price_change", false);
    });
  });

  it("should show push notification section", async () => {
    render(<NotificationSettingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Notifications push")).toBeInTheDocument();
    });
  });

  it("should show enable push button when not granted", async () => {
    render(<NotificationSettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("enable-push")).toBeInTheDocument();
    });
  });

  it("should show push subscriptions when granted", async () => {
    // Mock Notification API as granted
    Object.defineProperty(globalThis, "Notification", {
      value: { permission: "granted", requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });

    mockGetSubs.mockResolvedValue([
      {
        ID: "sub-1",
        userId: "user-1",
        endpoint: "https://push.example.com/sub1",
        p256dhKey: "key",
        authKey: "auth",
        deviceLabel: "Chrome Desktop",
        createdAt: "2026-02-20T10:00:00Z",
      },
    ]);

    render(<NotificationSettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("push-enabled")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId("push-sub-sub-1")).toBeInTheDocument();
      expect(screen.getByText("Chrome Desktop")).toBeInTheDocument();
    });

    // Clean up
    Object.defineProperty(globalThis, "Notification", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("should show denied message when push is blocked", async () => {
    Object.defineProperty(globalThis, "Notification", {
      value: { permission: "denied", requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    });

    render(<NotificationSettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("push-denied")).toBeInTheDocument();
    });

    Object.defineProperty(globalThis, "Notification", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });
});
