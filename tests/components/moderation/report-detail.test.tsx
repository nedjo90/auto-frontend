import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ReportDetail } from "@/components/moderation/report-detail";
import type { IReportDetail } from "@auto/shared";

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

const mockFetchReportDetail = vi.fn();
const mockAssignReport = vi.fn();

vi.mock("@/lib/api/moderation-api", () => ({
  fetchReportDetail: (...args: unknown[]) => mockFetchReportDetail(...args),
  assignReport: (...args: unknown[]) => mockAssignReport(...args),
}));

const LISTING_DETAIL: IReportDetail = {
  ID: "a0000000-0000-0000-0000-000000000001",
  reporterId: "b1",
  reporterName: "Jean Dupont",
  reporterEmail: "jean@test.com",
  targetType: "listing",
  targetId: "c1",
  targetLabel: null,
  reasonId: "d1",
  reasonLabel: "Annonce frauduleuse",
  severity: "high",
  description: "This listing appears to be fraudulent",
  status: "pending",
  assignedTo: null,
  createdAt: "2026-02-20T10:00:00.000Z",
  updatedAt: null,
  targetData: JSON.stringify({ make: "Peugeot", model: "308", year: 2023, price: 15000 }),
  relatedReportsCount: 2,
};

const USER_DETAIL: IReportDetail = {
  ...LISTING_DETAIL,
  targetType: "user",
  targetData: JSON.stringify({
    firstName: "Spammer",
    lastName: "User",
    email: "spam@test.com",
    createdAt: "2025-01-01T00:00:00Z",
  }),
  relatedReportsCount: 0,
};

describe("ReportDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssignReport.mockResolvedValue({ success: true });
  });

  it("shows loading skeleton initially", () => {
    mockFetchReportDetail.mockReturnValue(new Promise(() => {}));
    render(<ReportDetail reportId="r1" />);
    expect(screen.getByTestId("detail-skeleton")).toBeInTheDocument();
  });

  it("renders report detail for listing target", async () => {
    mockFetchReportDetail.mockResolvedValue(LISTING_DETAIL);

    render(<ReportDetail reportId="r1" />);

    await waitFor(() => {
      expect(screen.getByTestId("report-detail")).toBeInTheDocument();
    });

    expect(screen.getByTestId("report-info")).toBeInTheDocument();
    expect(screen.getByText("Annonce frauduleuse")).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("jean@test.com")).toBeInTheDocument();
  });

  it("renders target data for listing", async () => {
    mockFetchReportDetail.mockResolvedValue(LISTING_DETAIL);

    render(<ReportDetail reportId="r1" />);

    await waitFor(() => {
      expect(screen.getByTestId("target-data")).toBeInTheDocument();
    });

    expect(screen.getByText("Peugeot 308")).toBeInTheDocument();
    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("renders target data for user", async () => {
    mockFetchReportDetail.mockResolvedValue(USER_DETAIL);

    render(<ReportDetail reportId="r1" />);

    await waitFor(() => {
      expect(screen.getByTestId("target-data")).toBeInTheDocument();
    });

    expect(screen.getByText("Spammer User")).toBeInTheDocument();
    expect(screen.getByText("spam@test.com")).toBeInTheDocument();
  });

  it("shows related reports count", async () => {
    mockFetchReportDetail.mockResolvedValue(LISTING_DETAIL);

    render(<ReportDetail reportId="r1" />);

    await waitFor(() => {
      expect(screen.getByText(/2 autres signalements/)).toBeInTheDocument();
    });
  });

  it("auto-assigns pending report", async () => {
    mockFetchReportDetail.mockResolvedValue(LISTING_DETAIL);

    render(<ReportDetail reportId="r1" />);

    await waitFor(() => {
      expect(mockAssignReport).toHaveBeenCalledWith("r1");
    });
  });

  it("handles malformed targetData gracefully", async () => {
    mockFetchReportDetail.mockResolvedValue({
      ...LISTING_DETAIL,
      targetData: "not-valid-json{{{",
      status: "in_progress",
    });

    render(<ReportDetail reportId="r1" />);

    await waitFor(() => {
      expect(screen.getByTestId("target-data")).toBeInTheDocument();
    });
    expect(screen.getByText("Donnees de la cible non disponibles")).toBeInTheDocument();
  });

  it("does not auto-assign non-pending report", async () => {
    mockFetchReportDetail.mockResolvedValue({
      ...LISTING_DETAIL,
      status: "in_progress",
    });

    render(<ReportDetail reportId="r1" />);

    await waitFor(() => {
      expect(screen.getByTestId("report-detail")).toBeInTheDocument();
    });
    expect(mockAssignReport).not.toHaveBeenCalled();
  });

  it("shows error state on fetch failure", async () => {
    mockFetchReportDetail.mockRejectedValue(new Error("Rapport introuvable"));

    render(<ReportDetail reportId="bad-id" />);

    await waitFor(() => {
      expect(screen.getByTestId("detail-error")).toBeInTheDocument();
    });
    expect(screen.getByText("Rapport introuvable")).toBeInTheDocument();
  });

  it("renders action buttons placeholder", async () => {
    mockFetchReportDetail.mockResolvedValue(LISTING_DETAIL);

    render(<ReportDetail reportId="r1" />);

    await waitFor(() => {
      expect(screen.getByTestId("action-buttons")).toBeInTheDocument();
    });
  });

  it("shows breadcrumb navigation", async () => {
    mockFetchReportDetail.mockResolvedValue(LISTING_DETAIL);

    render(<ReportDetail reportId="r1" />);

    await waitFor(() => {
      expect(screen.getByText("Moderation")).toBeInTheDocument();
    });
  });
});
