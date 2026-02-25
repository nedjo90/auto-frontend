import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MetricDrilldown } from "@/components/seller/metric-drilldown";
import type { IMetricDrilldownData } from "@auto/shared";

const mockGetMetricDrilldown = vi.fn();

vi.mock("@/lib/api/seller-kpi-api", () => ({
  getMetricDrilldown: (...args: unknown[]) => mockGetMetricDrilldown(...args),
}));

const MOCK_DRILLDOWN: IMetricDrilldownData = {
  metric: "totalViews",
  listingId: null,
  points: [
    { date: "2026-02-01", value: 50 },
    { date: "2026-02-02", value: 55 },
    { date: "2026-02-03", value: 60 },
    { date: "2026-02-04", value: 58 },
    { date: "2026-02-05", value: 65 },
  ],
  insights: ["Les vues dépendent de la qualité de vos photos et de votre score de visibilité."],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetMetricDrilldown.mockResolvedValue(MOCK_DRILLDOWN);
});

describe("MetricDrilldown", () => {
  it("renders loading state initially", () => {
    mockGetMetricDrilldown.mockReturnValue(new Promise(() => {})); // never resolves
    render(<MetricDrilldown metric="totalViews" onClose={vi.fn()} />);
    expect(screen.getByTestId("drilldown-skeleton")).toBeInTheDocument();
  });

  it("renders chart after data loads", async () => {
    render(<MetricDrilldown metric="totalViews" onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTestId("metric-drilldown")).toBeInTheDocument();
    });
    expect(screen.getByTestId("trend-chart-svg")).toBeInTheDocument();
  });

  it("displays title with metric label", async () => {
    render(<MetricDrilldown metric="totalViews" onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText("Vues totales - Détail")).toBeInTheDocument();
    });
  });

  it("displays insights", async () => {
    render(<MetricDrilldown metric="totalViews" onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTestId("drilldown-insights")).toBeInTheDocument();
    });
    expect(screen.getByText(/qualité de vos photos/)).toBeInTheDocument();
  });

  it("renders period selector buttons", async () => {
    render(<MetricDrilldown metric="totalViews" onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTestId("period-selector")).toBeInTheDocument();
    });
    expect(screen.getByTestId("period-7")).toBeInTheDocument();
    expect(screen.getByTestId("period-30")).toBeInTheDocument();
    expect(screen.getByTestId("period-90")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MetricDrilldown metric="totalViews" onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByTestId("drilldown-close")).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("drilldown-close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("reloads data when period changes", async () => {
    const user = userEvent.setup();
    render(<MetricDrilldown metric="totalViews" onClose={vi.fn()} />);
    await waitFor(() => {
      expect(mockGetMetricDrilldown).toHaveBeenCalledWith("totalViews", {
        listingId: undefined,
        periodDays: 30,
      });
    });

    await user.click(screen.getByTestId("period-7"));
    await waitFor(() => {
      expect(mockGetMetricDrilldown).toHaveBeenCalledWith("totalViews", {
        listingId: undefined,
        periodDays: 7,
      });
    });
  });

  it("shows empty state when no data points", async () => {
    mockGetMetricDrilldown.mockResolvedValue({
      ...MOCK_DRILLDOWN,
      points: [],
      insights: [],
    });
    render(<MetricDrilldown metric="totalViews" onClose={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTestId("drilldown-empty")).toBeInTheDocument();
    });
  });
});
