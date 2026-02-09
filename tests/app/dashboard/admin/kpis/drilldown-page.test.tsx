import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ metric: mockMetric }),
}));

let mockMetric = "visitors";

const mockFetchDashboardTrend = vi.fn();
const mockFetchKpiDrillDown = vi.fn();

vi.mock("@/lib/api/dashboard-api", () => ({
  fetchDashboardTrend: (...args: unknown[]) => mockFetchDashboardTrend(...args),
  fetchKpiDrillDown: (...args: unknown[]) => mockFetchKpiDrillDown(...args),
}));

import KpiDrillDownPage from "@/app/(dashboard)/admin/kpis/[metric]/page";

const mockTrend = [
  { date: "2026-01-28", value: 10 },
  { date: "2026-01-29", value: 15 },
  { date: "2026-01-30", value: 12 },
];

const mockDrillDown = [
  { date: "2026-01-28", value: 10 },
  { date: "2026-01-29", value: 15 },
  { date: "2026-01-30", value: 12 },
];

describe("KpiDrillDownPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockMetric = "visitors";
  });

  it("should show loading state initially", () => {
    mockFetchDashboardTrend.mockImplementation(() => new Promise(() => {}));
    mockFetchKpiDrillDown.mockImplementation(() => new Promise(() => {}));
    render(<KpiDrillDownPage />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("should render metric title", async () => {
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    mockFetchKpiDrillDown.mockResolvedValue(mockDrillDown);
    render(<KpiDrillDownPage />);

    await waitFor(() => {
      expect(screen.getByText("Visiteurs")).toBeInTheDocument();
    });
  });

  it("should render summary cards with computed values", async () => {
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    mockFetchKpiDrillDown.mockResolvedValue(mockDrillDown);
    render(<KpiDrillDownPage />);

    await waitFor(() => {
      // Total = 10 + 15 + 12 = 37
      expect(screen.getByTestId("drilldown-total")).toHaveTextContent("37");
      // Average = 37 / 3 ≈ 12.3
      expect(screen.getByTestId("drilldown-avg")).toHaveTextContent("12.3");
      // Days = 3
      expect(screen.getByTestId("drilldown-days")).toHaveTextContent("3");
    });
  });

  it("should render trend chart", async () => {
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    mockFetchKpiDrillDown.mockResolvedValue(mockDrillDown);
    render(<KpiDrillDownPage />);

    await waitFor(() => {
      expect(screen.getByText("Visiteurs - Tendance")).toBeInTheDocument();
    });
  });

  it("should render data table", async () => {
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    mockFetchKpiDrillDown.mockResolvedValue(mockDrillDown);
    render(<KpiDrillDownPage />);

    await waitFor(() => {
      expect(screen.getByText("Detail par jour")).toBeInTheDocument();
    });
  });

  it("should navigate back to dashboard when clicking back button", async () => {
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    mockFetchKpiDrillDown.mockResolvedValue(mockDrillDown);
    const user = userEvent.setup();
    render(<KpiDrillDownPage />);

    await waitFor(() => {
      expect(screen.getByTestId("back-button")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("back-button"));
    expect(mockPush).toHaveBeenCalledWith("/admin");
  });

  it("should show error on fetch failure", async () => {
    mockFetchDashboardTrend.mockRejectedValue(new Error("Network error"));
    mockFetchKpiDrillDown.mockRejectedValue(new Error("Network error"));
    render(<KpiDrillDownPage />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should show invalid metric message for unknown metrics", () => {
    mockMetric = "unknown";
    render(<KpiDrillDownPage />);
    expect(screen.getByTestId("invalid-metric")).toBeInTheDocument();
  });

  it("should show period selector buttons", async () => {
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    mockFetchKpiDrillDown.mockResolvedValue(mockDrillDown);
    render(<KpiDrillDownPage />);

    await waitFor(() => {
      expect(screen.getByText("24h")).toBeInTheDocument();
      expect(screen.getByText("7j")).toBeInTheDocument();
      expect(screen.getByText("30j")).toBeInTheDocument();
    });
  });

  it("should change period and refetch data", async () => {
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    mockFetchKpiDrillDown.mockResolvedValue(mockDrillDown);
    const user = userEvent.setup();
    render(<KpiDrillDownPage />);

    await waitFor(() => {
      expect(screen.getByText("7j")).toBeInTheDocument();
    });

    await user.click(screen.getByText("7j"));

    await waitFor(() => {
      expect(mockFetchKpiDrillDown).toHaveBeenCalledWith("visitors", "week");
    });
  });

  it("should show empty state when no data", async () => {
    mockFetchDashboardTrend.mockResolvedValue([]);
    mockFetchKpiDrillDown.mockResolvedValue([]);
    render(<KpiDrillDownPage />);

    await waitFor(() => {
      expect(screen.getByText("Aucune donnee pour cette periode.")).toBeInTheDocument();
    });
  });
});
