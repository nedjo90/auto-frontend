import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KpiCard } from "@/components/admin/kpi-card";
import type { IKpiValue } from "@auto/shared";

describe("KpiCard", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const positiveData: IKpiValue = { current: 1250, previous: 1000, trend: 25 };
  const negativeData: IKpiValue = { current: 800, previous: 1000, trend: -20 };
  const neutralData: IKpiValue = { current: 500, previous: 500, trend: 0 };

  it("should render label and value", () => {
    render(<KpiCard label="Visiteurs" data={positiveData} />);
    expect(screen.getByText("Visiteurs")).toBeInTheDocument();
    // French locale: 1 250 (with narrow no-break space)
    expect(screen.getByTestId("kpi-value")).toHaveTextContent(/1[\s\u202f]?250/);
  });

  it("should show upward arrow for positive trend", () => {
    render(<KpiCard label="Visiteurs" data={positiveData} />);
    expect(screen.getByTestId("trend-up")).toBeInTheDocument();
    expect(screen.getByTestId("trend-value")).toHaveTextContent("+25.0%");
  });

  it("should show downward arrow for negative trend", () => {
    render(<KpiCard label="Ventes" data={negativeData} />);
    expect(screen.getByTestId("trend-down")).toBeInTheDocument();
    expect(screen.getByTestId("trend-value")).toHaveTextContent("-20.0%");
  });

  it("should show neutral indicator for zero trend", () => {
    render(<KpiCard label="Contacts" data={neutralData} />);
    expect(screen.getByTestId("trend-neutral")).toBeInTheDocument();
    expect(screen.getByTestId("trend-value")).toHaveTextContent("0.0%");
  });

  it("should format currency values when format is 'currency'", () => {
    const revenueData: IKpiValue = { current: 15000.5, previous: 12000, trend: 25 };
    render(<KpiCard label="Revenu" data={revenueData} format="currency" />);
    expect(screen.getByTestId("kpi-value")).toHaveTextContent(/€/);
  });

  it("should be clickable when onClick is provided", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<KpiCard label="Visiteurs" data={positiveData} onClick={onClick} />);

    const card = screen.getByRole("button");
    await user.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should support keyboard activation when onClick is provided", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<KpiCard label="Visiteurs" data={positiveData} onClick={onClick} />);

    const card = screen.getByRole("button");
    card.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should not have button role when onClick is not provided", () => {
    render(<KpiCard label="Visiteurs" data={positiveData} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("should show period comparison text", () => {
    render(<KpiCard label="Visiteurs" data={positiveData} />);
    expect(screen.getByText("vs periode prec.")).toBeInTheDocument();
  });
});
