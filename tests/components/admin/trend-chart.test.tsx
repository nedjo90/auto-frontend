import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TrendChart } from "@/components/admin/trend-chart";
import type { ITrendDataPoint } from "@auto/shared";

describe("TrendChart", () => {
  beforeEach(() => {
    cleanup();
  });

  const sampleData: ITrendDataPoint[] = [
    { date: "2026-01-01", value: 100 },
    { date: "2026-01-02", value: 120 },
    { date: "2026-01-03", value: 90 },
    { date: "2026-01-04", value: 150 },
    { date: "2026-01-05", value: 130 },
  ];

  it("should render chart title", () => {
    render(<TrendChart title="Tendance visiteurs" data={sampleData} />);
    expect(screen.getByText("Tendance visiteurs")).toBeInTheDocument();
  });

  it("should render SVG element when data is provided", () => {
    render(<TrendChart title="Tendance" data={sampleData} />);
    expect(screen.getByTestId("trend-chart-svg")).toBeInTheDocument();
  });

  it("should show empty state when no data", () => {
    render(<TrendChart title="Tendance" data={[]} />);
    expect(screen.getByTestId("trend-empty")).toBeInTheDocument();
    expect(screen.getByText("Aucune donnee disponible.")).toBeInTheDocument();
  });

  it("should render SVG with correct aria-label", () => {
    render(<TrendChart title="Tendance visiteurs" data={sampleData} />);
    const svg = screen.getByTestId("trend-chart-svg");
    expect(svg).toHaveAttribute(
      "aria-label",
      "Tendance visiteurs - graphique de tendance sur 5 jours",
    );
  });

  it("should render data points as circles", () => {
    render(<TrendChart title="Tendance" data={sampleData} />);
    const svg = screen.getByTestId("trend-chart-svg");
    const circles = svg.querySelectorAll("circle");
    expect(circles.length).toBe(sampleData.length);
  });

  it("should handle single data point", () => {
    const singlePoint: ITrendDataPoint[] = [{ date: "2026-01-01", value: 100 }];
    render(<TrendChart title="Tendance" data={singlePoint} />);
    expect(screen.getByTestId("trend-chart-svg")).toBeInTheDocument();
  });

  it("should handle data with same values", () => {
    const flatData: ITrendDataPoint[] = [
      { date: "2026-01-01", value: 50 },
      { date: "2026-01-02", value: 50 },
      { date: "2026-01-03", value: 50 },
    ];
    render(<TrendChart title="Tendance" data={flatData} />);
    expect(screen.getByTestId("trend-chart-svg")).toBeInTheDocument();
  });
});
