import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockFetchDashboardKpis = vi.fn();
const mockFetchDashboardTrend = vi.fn();

vi.mock("@/lib/api/dashboard-api", () => ({
  fetchDashboardKpis: (...args: unknown[]) => mockFetchDashboardKpis(...args),
  fetchDashboardTrend: (...args: unknown[]) => mockFetchDashboardTrend(...args),
}));

import AdminDashboardPage from "@/app/(dashboard)/admin/page";

const mockKpis = {
  visitors: { current: 1250, previous: 1000, trend: 25 },
  registrations: { current: 45, previous: 30, trend: 50 },
  listings: { current: 120, previous: 100, trend: 20 },
  contacts: { current: 80, previous: 90, trend: -11.1 },
  sales: { current: 30, previous: 25, trend: 20 },
  revenue: { current: 4500, previous: 3750, trend: 20 },
  trafficSources: [{ source: "direct", visits: 500, percentage: 40 }],
};

const mockTrend = [
  { date: "2026-01-01", value: 100 },
  { date: "2026-01-02", value: 120 },
  { date: "2026-01-03", value: 90 },
];

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show skeleton loading state initially", () => {
    mockFetchDashboardKpis.mockImplementation(() => new Promise(() => {}));
    mockFetchDashboardTrend.mockImplementation(() => new Promise(() => {}));
    render(<AdminDashboardPage />);
    expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    expect(screen.getAllByTestId("kpi-card-skeleton")).toHaveLength(6);
  });

  it("should render page title and description", () => {
    mockFetchDashboardKpis.mockImplementation(() => new Promise(() => {}));
    mockFetchDashboardTrend.mockImplementation(() => new Promise(() => {}));
    render(<AdminDashboardPage />);
    expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
    expect(screen.getByText(/Vue d'ensemble/)).toBeInTheDocument();
  });

  it("should render all 6 KPI cards after loading", async () => {
    mockFetchDashboardKpis.mockResolvedValue(mockKpis);
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Visiteurs")).toBeInTheDocument();
      expect(screen.getByText("Inscriptions")).toBeInTheDocument();
      expect(screen.getByText("Annonces publiees")).toBeInTheDocument();
      expect(screen.getByText("Contacts inities")).toBeInTheDocument();
      expect(screen.getByText("Ventes declarees")).toBeInTheDocument();
      expect(screen.getByText("Revenu")).toBeInTheDocument();
    });
  });

  it("should render trend chart after loading", async () => {
    mockFetchDashboardKpis.mockResolvedValue(mockKpis);
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Tendance visiteurs - 30 jours")).toBeInTheDocument();
    });
  });

  it("should fetch KPIs with 'week' period", async () => {
    mockFetchDashboardKpis.mockResolvedValue(mockKpis);
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(mockFetchDashboardKpis).toHaveBeenCalledWith("week");
    });
  });

  it("should fetch trend with 30 days for visitors", async () => {
    mockFetchDashboardKpis.mockResolvedValue(mockKpis);
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(mockFetchDashboardTrend).toHaveBeenCalledWith("visitors", 30);
    });
  });

  it("should show error message on fetch failure", async () => {
    mockFetchDashboardKpis.mockRejectedValue(new Error("Network error"));
    mockFetchDashboardTrend.mockRejectedValue(new Error("Network error"));
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should navigate to drill-down when clicking a KPI card", async () => {
    mockFetchDashboardKpis.mockResolvedValue(mockKpis);
    mockFetchDashboardTrend.mockResolvedValue(mockTrend);
    const user = userEvent.setup();
    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Visiteurs")).toBeInTheDocument();
    });

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]); // First KPI card = visitors

    expect(mockPush).toHaveBeenCalledWith("/admin/kpis/visitors");
  });
});
