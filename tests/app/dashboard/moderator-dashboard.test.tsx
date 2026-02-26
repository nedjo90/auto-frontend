import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ModeratorDashboardPage from "@/app/(dashboard)/moderator/page";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockFetchReportMetrics = vi.fn();
const mockFetchReportQueue = vi.fn();

vi.mock("@/lib/api/moderation-api", () => ({
  fetchReportMetrics: (...args: unknown[]) => mockFetchReportMetrics(...args),
  fetchReportQueue: (...args: unknown[]) => mockFetchReportQueue(...args),
}));

describe("ModeratorDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders dashboard with title", async () => {
    mockFetchReportMetrics.mockResolvedValue({
      pendingCount: 5,
      inProgressCount: 3,
      treatedThisWeek: 10,
      dismissedThisWeek: 2,
      weeklyTrend: 20,
    });
    mockFetchReportQueue.mockResolvedValue({ items: [], total: 0, hasMore: false });

    render(<ModeratorDashboardPage />);

    expect(screen.getByTestId("moderator-dashboard")).toBeInTheDocument();
    expect(screen.getByText("Moderation")).toBeInTheDocument();
  });

  it("loads and displays metrics", async () => {
    mockFetchReportMetrics.mockResolvedValue({
      pendingCount: 5,
      inProgressCount: 3,
      treatedThisWeek: 10,
      dismissedThisWeek: 2,
      weeklyTrend: 20,
    });
    mockFetchReportQueue.mockResolvedValue({ items: [], total: 0, hasMore: false });

    render(<ModeratorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId("metrics-summary")).toBeInTheDocument();
    });
    expect(screen.getByTestId("metric-pending")).toHaveTextContent("5");
  });

  it("loads report queue", async () => {
    mockFetchReportMetrics.mockResolvedValue({
      pendingCount: 0,
      inProgressCount: 0,
      treatedThisWeek: 0,
      dismissedThisWeek: 0,
      weeklyTrend: 0,
    });
    mockFetchReportQueue.mockResolvedValue({ items: [], total: 0, hasMore: false });

    render(<ModeratorDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId("report-queue")).toBeInTheDocument();
    });
  });
});
