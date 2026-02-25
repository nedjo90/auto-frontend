import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SellerKpiGrid } from "@/components/seller/seller-kpi-grid";
import type { ISellerKpiSummary } from "@auto/shared";

const MOCK_KPIS: ISellerKpiSummary = {
  activeListings: { current: 5, previous: 3, trend: 66.7 },
  totalViews: { current: 320, previous: 280, trend: 14.3 },
  totalContacts: { current: 12, previous: 10, trend: 20 },
  avgDaysOnline: { current: 15, previous: 12, trend: 25 },
};

describe("SellerKpiGrid", () => {
  it("renders loading skeletons when loading", () => {
    render(<SellerKpiGrid kpis={null} loading={true} />);
    expect(screen.getByTestId("kpi-grid-skeleton")).toBeInTheDocument();
  });

  it("renders nothing when kpis is null and not loading", () => {
    const { container } = render(<SellerKpiGrid kpis={null} loading={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders all 4 KPI cards with correct values", () => {
    render(<SellerKpiGrid kpis={MOCK_KPIS} loading={false} />);
    expect(screen.getByTestId("seller-kpi-grid")).toBeInTheDocument();
    expect(screen.getByText("Annonces actives")).toBeInTheDocument();
    expect(screen.getByText("Vues totales")).toBeInTheDocument();
    expect(screen.getByText("Contacts reçus")).toBeInTheDocument();
    expect(screen.getByText("Jours en ligne (moy.)")).toBeInTheDocument();
  });

  it("renders current values correctly", () => {
    render(<SellerKpiGrid kpis={MOCK_KPIS} loading={false} />);
    const values = screen.getAllByTestId("kpi-value");
    expect(values).toHaveLength(4);
  });

  it("calls onKpiClick when a KPI card is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SellerKpiGrid kpis={MOCK_KPIS} loading={false} onKpiClick={onClick} />);
    await user.click(screen.getByText("Annonces actives").closest("[role='button']")!);
    expect(onClick).toHaveBeenCalledWith("activeListings");
  });

  it("shows trend indicators", () => {
    render(<SellerKpiGrid kpis={MOCK_KPIS} loading={false} />);
    const trendUps = screen.getAllByTestId("trend-up");
    expect(trendUps.length).toBeGreaterThanOrEqual(1);
  });
});
