import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetchApiCostSummary = vi.fn();

vi.mock("@/lib/api/config-api", () => ({
  fetchApiCostSummary: (...args: unknown[]) => mockFetchApiCostSummary(...args),
}));

import CostTrackingPage from "@/app/(dashboard)/admin/config/costs/page";

const mockSummary = {
  totalCost: 12.5,
  callCount: 1500,
  avgCostPerCall: 0.0083,
  byProvider: JSON.stringify([
    { providerKey: "azure.adb2c", totalCost: 10.0, callCount: 1200 },
    { providerKey: "azure.blob", totalCost: 2.5, callCount: 300 },
  ]),
};

const mockEmptySummary = {
  totalCost: 0,
  callCount: 0,
  avgCostPerCall: 0,
  byProvider: "[]",
};

describe("CostTrackingPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetchApiCostSummary.mockImplementation(() => new Promise(() => {}));
    render(<CostTrackingPage />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("should render summary cards after loading", async () => {
    mockFetchApiCostSummary.mockResolvedValue(mockSummary);
    render(<CostTrackingPage />);

    await waitFor(() => {
      expect(screen.getByText("12.50 €")).toBeInTheDocument(); // total cost
      expect(screen.getByText("1500")).toBeInTheDocument(); // call count
    });
  });

  it("should render card titles", async () => {
    mockFetchApiCostSummary.mockResolvedValue(mockSummary);
    render(<CostTrackingPage />);

    await waitFor(() => {
      // "Cout total" and "Cout moyen / appel" appear both as card titles and table headers
      expect(screen.getAllByText("Cout total").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Nombre d/)).toBeInTheDocument();
      expect(screen.getAllByText("Cout moyen / appel").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Marge / annonce")).toBeInTheDocument();
    });
  });

  it("should compute margin correctly (15 EUR - avgCostPerCall)", async () => {
    mockFetchApiCostSummary.mockResolvedValue(mockSummary);
    render(<CostTrackingPage />);

    // margin = 15 - 0.0083 = 14.9917, displayed as 14.99
    await waitFor(() => {
      expect(screen.getByText(/14\.99/)).toBeInTheDocument();
    });
  });

  it("should render provider breakdown table", async () => {
    mockFetchApiCostSummary.mockResolvedValue(mockSummary);
    render(<CostTrackingPage />);

    await waitFor(() => {
      expect(screen.getByText("Repartition par fournisseur")).toBeInTheDocument();
      expect(screen.getByText("azure.adb2c")).toBeInTheDocument();
      expect(screen.getByText("azure.blob")).toBeInTheDocument();
    });
  });

  it("should render period selector buttons", async () => {
    mockFetchApiCostSummary.mockResolvedValue(mockSummary);
    render(<CostTrackingPage />);

    await waitFor(() => {
      expect(screen.getByText("Dernieres 24h")).toBeInTheDocument();
      expect(screen.getByText("7 derniers jours")).toBeInTheDocument();
      expect(screen.getByText("30 derniers jours")).toBeInTheDocument();
    });
  });

  it("should change period when clicking a different button", async () => {
    mockFetchApiCostSummary.mockResolvedValue(mockSummary);
    const user = userEvent.setup();
    render(<CostTrackingPage />);

    await waitFor(() => {
      expect(screen.getByText("7 derniers jours")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Dernieres 24h"));

    await waitFor(() => {
      expect(mockFetchApiCostSummary).toHaveBeenCalledWith("day");
    });
  });

  it("should show error message on fetch failure", async () => {
    mockFetchApiCostSummary.mockRejectedValue(new Error("Fetch failed"));
    render(<CostTrackingPage />);

    await waitFor(() => {
      expect(screen.getByText("Fetch failed")).toBeInTheDocument();
    });
  });

  it("should show empty state when no API calls", async () => {
    mockFetchApiCostSummary.mockResolvedValue(mockEmptySummary);
    render(<CostTrackingPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Aucun appel API enregistre pour cette periode."),
      ).toBeInTheDocument();
    });
  });

  it("should show description text", async () => {
    mockFetchApiCostSummary.mockResolvedValue(mockSummary);
    render(<CostTrackingPage />);

    expect(screen.getByText(/Suivi des couts API/)).toBeInTheDocument();
  });

  it("should fetch with default period 'week' on mount", async () => {
    mockFetchApiCostSummary.mockResolvedValue(mockSummary);
    render(<CostTrackingPage />);

    await waitFor(() => {
      expect(mockFetchApiCostSummary).toHaveBeenCalledWith("week");
    });
  });
});
