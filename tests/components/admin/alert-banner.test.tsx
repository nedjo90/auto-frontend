import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetchActiveAlerts = vi.fn();
const mockAcknowledgeAlert = vi.fn();

vi.mock("@/lib/api/alerts-api", () => ({
  fetchActiveAlerts: (...args: unknown[]) => mockFetchActiveAlerts(...args),
  acknowledgeAlert: (...args: unknown[]) => mockAcknowledgeAlert(...args),
}));

vi.mock("@/hooks/use-signalr", () => ({
  useSignalR: vi.fn(() => ({ status: "disconnected", disconnect: vi.fn() })),
}));

import { AlertBanner } from "@/components/admin/alert-banner";

const mockAlerts = [
  {
    ID: "e1",
    alertId: "a1",
    metric: "margin_per_listing",
    currentValue: 5,
    thresholdValue: 8,
    severity: "critical",
    message: "Margin below threshold",
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    createdAt: "2026-02-11T12:00:00Z",
  },
  {
    ID: "e2",
    alertId: "a2",
    metric: "api_availability",
    currentValue: 90,
    thresholdValue: 95,
    severity: "warning",
    message: "API availability low",
    acknowledged: false,
    acknowledgedBy: null,
    acknowledgedAt: null,
    createdAt: "2026-02-11T11:00:00Z",
  },
];

describe("AlertBanner", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render nothing when no active alerts", async () => {
    mockFetchActiveAlerts.mockResolvedValue([]);
    const { container } = render(<AlertBanner />);
    await waitFor(() => {
      expect(mockFetchActiveAlerts).toHaveBeenCalled();
    });
    expect(container.querySelector("[data-testid='alert-banner']")).toBeNull();
  });

  it("should render alert banner with active alerts", async () => {
    mockFetchActiveAlerts.mockResolvedValue(mockAlerts);
    render(<AlertBanner />);
    await waitFor(() => {
      expect(screen.getByTestId("alert-banner")).toBeInTheDocument();
    });
    expect(screen.getByText("Margin below threshold")).toBeInTheDocument();
    expect(screen.getByText("API availability low")).toBeInTheDocument();
  });

  it("should display acknowledge button for each alert", async () => {
    mockFetchActiveAlerts.mockResolvedValue(mockAlerts);
    render(<AlertBanner />);
    await waitFor(() => {
      expect(screen.getByTestId("alert-ack-e1")).toBeInTheDocument();
      expect(screen.getByTestId("alert-ack-e2")).toBeInTheDocument();
    });
  });

  it("should remove alert after acknowledgement", async () => {
    mockFetchActiveAlerts.mockResolvedValue(mockAlerts);
    mockAcknowledgeAlert.mockResolvedValue({ success: true, message: "ok" });
    const user = userEvent.setup();
    render(<AlertBanner />);
    await waitFor(() => {
      expect(screen.getByTestId("alert-ack-e1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("alert-ack-e1"));
    await waitFor(() => {
      expect(mockAcknowledgeAlert).toHaveBeenCalledWith("e1");
    });
    await waitFor(() => {
      expect(screen.queryByTestId("alert-banner-item-e1")).toBeNull();
    });
  });

  it("should show severity-appropriate styling", async () => {
    mockFetchActiveAlerts.mockResolvedValue(mockAlerts);
    render(<AlertBanner />);
    await waitFor(() => {
      const criticalItem = screen.getByTestId("alert-banner-item-e1");
      expect(criticalItem.className).toContain("red");
      const warningItem = screen.getByTestId("alert-banner-item-e2");
      expect(warningItem.className).toContain("yellow");
    });
  });

  it("should display alert creation timestamp", async () => {
    mockFetchActiveAlerts.mockResolvedValue([mockAlerts[0]]);
    render(<AlertBanner />);
    await waitFor(() => {
      expect(screen.getByTestId("alert-banner-item-e1")).toBeInTheDocument();
    });
    // French locale date format should be present
    const item = screen.getByTestId("alert-banner-item-e1");
    expect(item.textContent).toContain("2026");
  });

  it("should handle fetch failure gracefully", async () => {
    mockFetchActiveAlerts.mockRejectedValue(new Error("Network error"));
    const { container } = render(<AlertBanner />);
    await waitFor(() => {
      expect(mockFetchActiveAlerts).toHaveBeenCalled();
    });
    // Should not crash, should render nothing
    expect(container.querySelector("[data-testid='alert-banner']")).toBeNull();
  });

  it("should handle acknowledge failure gracefully", async () => {
    mockFetchActiveAlerts.mockResolvedValue(mockAlerts);
    mockAcknowledgeAlert.mockRejectedValue(new Error("Server error"));
    const user = userEvent.setup();
    render(<AlertBanner />);
    await waitFor(() => {
      expect(screen.getByTestId("alert-ack-e1")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("alert-ack-e1"));
    // Alert should remain visible after failed acknowledge
    await waitFor(() => {
      expect(screen.getByTestId("alert-banner-item-e1")).toBeInTheDocument();
    });
  });
});
