import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricsSummary } from "@/components/moderation/metrics-summary";
import type { IReportMetrics } from "@auto/shared";

const MOCK_METRICS: IReportMetrics = {
  pendingCount: 5,
  inProgressCount: 3,
  treatedThisWeek: 10,
  dismissedThisWeek: 2,
  weeklyTrend: 20,
};

describe("MetricsSummary", () => {
  it("renders loading skeleton when loading", () => {
    render(<MetricsSummary metrics={null} loading />);
    expect(screen.getByTestId("metrics-skeleton")).toBeInTheDocument();
  });

  it("renders nothing when metrics is null and not loading", () => {
    const { container } = render(<MetricsSummary metrics={null} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders all metric cards with correct values", () => {
    render(<MetricsSummary metrics={MOCK_METRICS} />);
    expect(screen.getByTestId("metrics-summary")).toBeInTheDocument();
    expect(screen.getByTestId("metric-pending")).toHaveTextContent("5");
    expect(screen.getByTestId("metric-in-progress")).toHaveTextContent("3");
    expect(screen.getByTestId("metric-treated")).toHaveTextContent("10");
    expect(screen.getByTestId("metric-dismissed")).toHaveTextContent("2");
  });

  it("shows positive weekly trend", () => {
    render(<MetricsSummary metrics={MOCK_METRICS} />);
    const trend = screen.getByTestId("weekly-trend");
    expect(trend).toHaveTextContent("+20%");
  });

  it("shows negative weekly trend", () => {
    render(<MetricsSummary metrics={{ ...MOCK_METRICS, weeklyTrend: -15 }} />);
    const trend = screen.getByTestId("weekly-trend");
    expect(trend).toHaveTextContent("-15%");
  });
});
