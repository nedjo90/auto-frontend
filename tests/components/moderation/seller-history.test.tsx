import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SellerHistory } from "@/components/moderation/seller-history";
import type { ISellerHistory } from "@auto/shared";

const mockFetchSellerHistory = vi.fn();

vi.mock("@/lib/api/moderation-api", () => ({
  fetchSellerHistory: (...args: unknown[]) => mockFetchSellerHistory(...args),
  deactivateAccount: vi.fn(),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const SELLER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const MOCK_HISTORY: ISellerHistory = {
  sellerId: SELLER_ID,
  displayName: "Jean Dupont",
  memberSince: "2024-01-15T10:00:00Z",
  accountStatus: "active",
  sellerRating: 4.2,
  statistics: {
    totalListings: 5,
    activeListings: 3,
    reportsReceived: 2,
    warningsReceived: 1,
    suspensions: 0,
    certificationRate: 60,
  },
  patterns: [],
  timeline: [
    {
      id: "evt-1",
      date: "2026-02-20T10:00:00Z",
      eventType: "report",
      description: "Signalement: Fraude",
      outcome: "Traite",
      moderatorId: "mod-1",
      reportId: "rpt-1",
      reason: "Annonce suspecte",
    },
    {
      id: "evt-2",
      date: "2026-02-18T10:00:00Z",
      eventType: "warning",
      description: "Avertissement envoye",
      outcome: null,
      moderatorId: "mod-1",
      reportId: "rpt-1",
      reason: "Premier avertissement",
    },
  ],
};

describe("SellerHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton initially", () => {
    mockFetchSellerHistory.mockReturnValue(new Promise(() => {})); // never resolves
    render(<SellerHistory sellerId={SELLER_ID} />);
    expect(screen.getByTestId("seller-history-skeleton")).toBeDefined();
  });

  it("shows error state on fetch failure", async () => {
    mockFetchSellerHistory.mockRejectedValue(new Error("Network error"));
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId("seller-history-error")).toBeDefined();
    });
    expect(screen.getByText("Network error")).toBeDefined();
  });

  it("renders seller profile summary", async () => {
    mockFetchSellerHistory.mockResolvedValue(MOCK_HISTORY);
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId("seller-history")).toBeDefined();
    });

    expect(screen.getByTestId("seller-name").textContent).toBe("Jean Dupont");
    expect(screen.getByTestId("account-status").textContent).toBe("Actif");
  });

  it("renders statistics cards", async () => {
    mockFetchSellerHistory.mockResolvedValue(MOCK_HISTORY);
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId("statistics")).toBeDefined();
    });

    expect(screen.getByText("5")).toBeDefined(); // total listings
    expect(screen.getByText("3")).toBeDefined(); // active listings
    expect(screen.getByText("2")).toBeDefined(); // reports
    expect(screen.getByText("1")).toBeDefined(); // warnings
    expect(screen.getByText("60%")).toBeDefined(); // certification rate
  });

  it("renders timeline events", async () => {
    mockFetchSellerHistory.mockResolvedValue(MOCK_HISTORY);
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId("timeline")).toBeDefined();
    });

    const events = screen.getAllByTestId("timeline-event");
    expect(events.length).toBe(2);
    expect(screen.getByText("Signalement: Fraude")).toBeDefined();
    expect(screen.getByText("Avertissement envoye")).toBeDefined();
  });

  it("shows empty timeline message when no events", async () => {
    mockFetchSellerHistory.mockResolvedValue({ ...MOCK_HISTORY, timeline: [] });
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(screen.getByText("Aucun evenement de moderation")).toBeDefined();
    });
  });

  it("shows suspended badge for suspended accounts", async () => {
    mockFetchSellerHistory.mockResolvedValue({ ...MOCK_HISTORY, accountStatus: "suspended" });
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId("account-status").textContent).toBe("Suspendu");
    });
  });

  it("renders breadcrumb with report link when fromReportId provided", async () => {
    mockFetchSellerHistory.mockResolvedValue(MOCK_HISTORY);
    render(<SellerHistory sellerId={SELLER_ID} fromReportId="rpt-12345678-abcd" />);

    await waitFor(() => {
      expect(screen.getByTestId("seller-history")).toBeDefined();
    });

    expect(screen.getByText("Rapport #rpt-1234")).toBeDefined();
  });

  it("shows pattern alerts when patterns exist", async () => {
    const withPatterns: ISellerHistory = {
      ...MOCK_HISTORY,
      patterns: [
        {
          type: "frequentReports",
          description: "3 signalements en 30 jours",
          count: 3,
          period: "30j",
          severity: "warning",
        },
      ],
    };
    mockFetchSellerHistory.mockResolvedValue(withPatterns);
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId("pattern-alerts")).toBeDefined();
    });
    expect(screen.getByText("3 signalements en 30 jours")).toBeDefined();
  });

  it("displays seller rating when available", async () => {
    mockFetchSellerHistory.mockResolvedValue(MOCK_HISTORY);
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId("seller-rating")).toBeDefined();
    });
    expect(screen.getByText("4.2 / 5")).toBeDefined();
  });

  it("hides seller rating when null", async () => {
    mockFetchSellerHistory.mockResolvedValue({ ...MOCK_HISTORY, sellerRating: null });
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(screen.getByTestId("seller-history")).toBeDefined();
    });
    expect(screen.queryByTestId("seller-rating")).toBeNull();
  });

  it("calls fetchSellerHistory with correct sellerId", async () => {
    mockFetchSellerHistory.mockResolvedValue(MOCK_HISTORY);
    render(<SellerHistory sellerId={SELLER_ID} />);

    await waitFor(() => {
      expect(mockFetchSellerHistory).toHaveBeenCalledWith(SELLER_ID);
    });
  });
});
