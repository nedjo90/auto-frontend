import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReportQueue } from "@/components/moderation/report-queue";
import type { IReport } from "@auto/shared";

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

const mockFetchReportQueue = vi.fn();

vi.mock("@/lib/api/moderation-api", () => ({
  fetchReportQueue: (...args: unknown[]) => mockFetchReportQueue(...args),
}));

const MOCK_REPORT: IReport = {
  ID: "a0000000-0000-0000-0000-000000000001",
  reporterId: "b1",
  reporterName: "Jean",
  targetType: "listing",
  targetId: "c1",
  targetLabel: "Peugeot 308",
  reasonId: "d1",
  reasonLabel: "Fraude",
  severity: "high",
  description: "Test",
  status: "pending",
  assignedTo: null,
  createdAt: new Date().toISOString(),
  updatedAt: null,
};

describe("ReportQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton initially", () => {
    mockFetchReportQueue.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ReportQueue />);
    expect(screen.getByTestId("queue-skeleton")).toBeInTheDocument();
  });

  it("renders report cards after loading", async () => {
    mockFetchReportQueue.mockResolvedValue({
      items: [MOCK_REPORT],
      total: 1,
      hasMore: false,
    });

    render(<ReportQueue />);

    await waitFor(() => {
      expect(screen.getByTestId(`report-card-${MOCK_REPORT.ID}`)).toBeInTheDocument();
    });
    expect(screen.getByTestId("queue-total")).toHaveTextContent("1 signalement");
  });

  it("shows empty state when no reports match", async () => {
    mockFetchReportQueue.mockResolvedValue({
      items: [],
      total: 0,
      hasMore: false,
    });

    render(<ReportQueue />);

    await waitFor(() => {
      expect(screen.getByTestId("queue-empty")).toBeInTheDocument();
    });
  });

  it("shows error message on fetch failure", async () => {
    mockFetchReportQueue.mockRejectedValue(new Error("Network error"));

    render(<ReportQueue />);

    await waitFor(() => {
      expect(screen.getByTestId("queue-error")).toHaveTextContent("Network error");
    });
  });

  it("renders filter controls", async () => {
    mockFetchReportQueue.mockResolvedValue({ items: [], total: 0, hasMore: false });

    render(<ReportQueue />);

    await waitFor(() => {
      expect(screen.getByTestId("queue-filters")).toBeInTheDocument();
    });
    expect(screen.getByTestId("filter-status")).toBeInTheDocument();
    expect(screen.getByTestId("filter-target-type")).toBeInTheDocument();
    expect(screen.getByTestId("filter-severity")).toBeInTheDocument();
    expect(screen.getByTestId("sort-select")).toBeInTheDocument();
  });

  it("shows load more button when hasMore is true", async () => {
    mockFetchReportQueue.mockResolvedValue({
      items: [MOCK_REPORT],
      total: 25,
      hasMore: true,
    });

    render(<ReportQueue />);

    await waitFor(() => {
      expect(screen.getByTestId("load-more")).toBeInTheDocument();
    });
  });
});
