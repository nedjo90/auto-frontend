import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";

const mockFetchConfigEntities = vi.fn();
const mockFetchProviderAnalytics = vi.fn();

vi.mock("@/lib/api/config-api", () => ({
  fetchConfigEntities: (...args: unknown[]) => mockFetchConfigEntities(...args),
  fetchProviderAnalytics: (...args: unknown[]) => mockFetchProviderAnalytics(...args),
}));

import AnalyticsComparisonPage from "@/app/(dashboard)/admin/config/analytics/page";

const mockProviders = [
  {
    ID: "p1",
    key: "azure.adb2c",
    adapterInterface: "IIdentityProviderAdapter",
    status: "active",
    baseUrl: "https://login.microsoftonline.com",
    costPerCall: 0.001,
  },
  {
    ID: "p2",
    key: "keycloak",
    adapterInterface: "IIdentityProviderAdapter",
    status: "inactive",
    baseUrl: "https://keycloak.example.com",
    costPerCall: 0.0,
  },
  {
    ID: "p3",
    key: "azure.blob",
    adapterInterface: "IBlobStorageAdapter",
    status: "active",
    baseUrl: "https://blob.core.windows.net",
    costPerCall: 0.0005,
  },
];

const mockAnalytics: Record<string, unknown> = {
  "azure.adb2c": {
    avgResponseTimeMs: 150,
    successRate: 99.5,
    totalCalls: 500,
    totalCost: 0.5,
    avgCostPerCall: 0.001,
    lastCallTimestamp: "2026-02-09T10:30:00.000Z",
  },
  keycloak: {
    avgResponseTimeMs: 0,
    successRate: 0,
    totalCalls: 0,
    totalCost: 0,
    avgCostPerCall: 0,
    lastCallTimestamp: null,
  },
  "azure.blob": {
    avgResponseTimeMs: 80,
    successRate: 100,
    totalCalls: 200,
    totalCost: 0.1,
    avgCostPerCall: 0.0005,
    lastCallTimestamp: "2026-02-09T08:15:00.000Z",
  },
};

function setupMocks() {
  mockFetchConfigEntities.mockResolvedValue(mockProviders);
  mockFetchProviderAnalytics.mockImplementation((key: string) =>
    Promise.resolve(mockAnalytics[key] ?? {}),
  );
}

describe("AnalyticsComparisonPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetchConfigEntities.mockImplementation(() => new Promise(() => {}));
    render(<AnalyticsComparisonPage />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("should render comparison table after loading", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getByText("azure.adb2c")).toBeInTheDocument();
      expect(screen.getByText("keycloak")).toBeInTheDocument();
      expect(screen.getByText("azure.blob")).toBeInTheDocument();
    });
  });

  it("should show description text", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getByText(/Comparez les performances/)).toBeInTheDocument();
    });
  });

  it("should render summary cards", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getByText("Fournisseurs actifs")).toBeInTheDocument();
      expect(screen.getAllByText("Appels totaux").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Cout total").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Disponibilite moyenne")).toBeInTheDocument();
    });
  });

  it("should compute active providers count", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      // 2 active providers (azure.adb2c and azure.blob)
      const card = screen.getByText("Fournisseurs actifs").closest("[data-slot='card']");
      expect(card).toHaveTextContent("2");
    });
  });

  it("should compute total calls across providers", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      // 500 + 0 + 200 = 700
      expect(screen.getByText("700")).toBeInTheDocument();
    });
  });

  it("should render comparison table headers", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getByText("Comparaison des fournisseurs")).toBeInTheDocument();
      expect(screen.getByText("Temps reponse moy.")).toBeInTheDocument();
      expect(screen.getByText("Taux de succes")).toBeInTheDocument();
    });
  });

  it("should show cost per call for each provider", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getByText(/0\.0010 \u20AC/)).toBeInTheDocument(); // azure.adb2c
      expect(screen.getByText(/0\.0005 \u20AC/)).toBeInTheDocument(); // azure.blob
    });
  });

  it("should show response time for providers with calls", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getByText("150 ms")).toBeInTheDocument(); // azure.adb2c
      expect(screen.getByText("80 ms")).toBeInTheDocument(); // azure.blob
    });
  });

  it("should show success rate for providers with calls", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getByText("99.5%")).toBeInTheDocument(); // azure.adb2c
      expect(screen.getByText("100%")).toBeInTheDocument(); // azure.blob
    });
  });

  it("should show status badges", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      const activeBadges = screen.getAllByText("Actif");
      expect(activeBadges).toHaveLength(2);
      expect(screen.getByText("Inactif")).toBeInTheDocument();
    });
  });

  it("should show adapter interface for each provider", async () => {
    setupMocks();
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getAllByText("IIdentityProviderAdapter")).toHaveLength(2);
      expect(screen.getByText("IBlobStorageAdapter")).toBeInTheDocument();
    });
  });

  it("should show error message on fetch failure", async () => {
    mockFetchConfigEntities.mockRejectedValue(new Error("Network error"));
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should show empty state when no providers", async () => {
    mockFetchConfigEntities.mockResolvedValue([]);
    render(<AnalyticsComparisonPage />);

    await waitFor(() => {
      expect(screen.getByText("Aucun fournisseur API configure.")).toBeInTheDocument();
    });
  });

  it("should handle analytics fetch failure gracefully", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockProviders);
    mockFetchProviderAnalytics.mockRejectedValue(new Error("Analytics failed"));
    render(<AnalyticsComparisonPage />);

    // Should still render providers even if analytics fail
    await waitFor(() => {
      expect(screen.getByText("azure.adb2c")).toBeInTheDocument();
    });
  });
});
