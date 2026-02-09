import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetchConfigEntities = vi.fn();
const mockFetchProviderAnalytics = vi.fn();
const mockSwitchProvider = vi.fn();

vi.mock("@/lib/api/config-api", () => ({
  fetchConfigEntities: (...args: unknown[]) => mockFetchConfigEntities(...args),
  fetchProviderAnalytics: (...args: unknown[]) => mockFetchProviderAnalytics(...args),
  switchProvider: (...args: unknown[]) => mockSwitchProvider(...args),
}));

import ProvidersConfigPage from "@/app/(dashboard)/admin/config/providers/page";

const mockProviders = [
  {
    ID: "p1",
    key: "azure.adb2c",
    adapterInterface: "IIdentityProviderAdapter",
    status: "active",
    baseUrl: "https://login.microsoftonline.com",
    costPerCall: 0.001,
    callCount: 500,
  },
  {
    ID: "p2",
    key: "keycloak",
    adapterInterface: "IIdentityProviderAdapter",
    status: "inactive",
    baseUrl: "https://keycloak.example.com",
    costPerCall: 0.0,
    callCount: 0,
  },
  {
    ID: "p3",
    key: "azure.blob",
    adapterInterface: "IBlobStorageAdapter",
    status: "active",
    baseUrl: "https://blob.core.windows.net",
    costPerCall: 0.0005,
    callCount: 200,
  },
];

const mockAnalytics = {
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
    Promise.resolve(mockAnalytics[key as keyof typeof mockAnalytics] ?? {}),
  );
}

describe("ProvidersConfigPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetchConfigEntities.mockImplementation(() => new Promise(() => {}));
    render(<ProvidersConfigPage />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("should render provider table after loading", async () => {
    setupMocks();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      expect(screen.getByText("azure.adb2c")).toBeInTheDocument();
      expect(screen.getByText("keycloak")).toBeInTheDocument();
      expect(screen.getByText("azure.blob")).toBeInTheDocument();
    });
  });

  it("should group providers by adapter interface", async () => {
    setupMocks();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      expect(screen.getByText("IIdentityProviderAdapter")).toBeInTheDocument();
      expect(screen.getByText("IBlobStorageAdapter")).toBeInTheDocument();
    });
  });

  it("should show status badges", async () => {
    setupMocks();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      // 2 active providers (azure.adb2c and azure.blob)
      const activeBadges = screen.getAllByText("Actif");
      expect(activeBadges).toHaveLength(2);
      expect(screen.getByText("Inactif")).toBeInTheDocument();
    });
  });

  it("should show Activer button for inactive providers", async () => {
    setupMocks();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      const activateButtons = screen.getAllByText("Activer");
      expect(activateButtons).toHaveLength(1); // only keycloak is inactive
    });
  });

  it("should show 'Fournisseur actif' label for active providers", async () => {
    setupMocks();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      const activeLabels = screen.getAllByText("Fournisseur actif");
      expect(activeLabels).toHaveLength(2); // azure.adb2c and azure.blob
    });
  });

  it("should show availability rate when analytics available", async () => {
    setupMocks();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      expect(screen.getByText("99.5%")).toBeInTheDocument(); // availability rate for azure.adb2c
      expect(screen.getByText("100%")).toBeInTheDocument(); // availability rate for azure.blob
    });
  });

  it("should show last call timestamp when available", async () => {
    setupMocks();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      // Timestamps are formatted with toLocaleString("fr-FR")
      // Check that the dates are rendered (exact format depends on locale)
      const cells = document.querySelectorAll("td");
      const hasTimestamp = Array.from(cells).some(
        (cell) => cell.textContent?.includes("2026") || cell.textContent?.includes("09/02/2026"),
      );
      expect(hasTimestamp).toBe(true);
    });
  });

  it("should show error message on fetch failure", async () => {
    mockFetchConfigEntities.mockRejectedValue(new Error("Network error"));
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should show empty state when no providers", async () => {
    mockFetchConfigEntities.mockResolvedValue([]);
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      expect(screen.getByText("Aucun fournisseur API configure.")).toBeInTheDocument();
    });
  });

  it("should open confirm dialog when clicking Activer", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      expect(screen.getByText("Activer")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Activer"));

    await waitFor(() => {
      expect(screen.getByText("Confirmer le changement de fournisseur")).toBeInTheDocument();
    });
  });

  it("should display change details in confirm dialog", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      expect(screen.getByText("Activer")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Activer"));

    await waitFor(() => {
      // Should show that current active provider will be deactivated
      expect(screen.getByText("azure.adb2c - Statut")).toBeInTheDocument();
      expect(screen.getByText("keycloak - Statut")).toBeInTheDocument();
    });
  });

  it("should call switchProvider on confirm", async () => {
    setupMocks();
    mockSwitchProvider.mockResolvedValue({ success: true, message: "Switched" });
    // After switch, reload returns updated providers
    mockFetchConfigEntities
      .mockResolvedValueOnce(mockProviders) // initial load
      .mockResolvedValueOnce(mockProviders); // reload after switch
    const user = userEvent.setup();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      expect(screen.getByText("Activer")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Activer"));

    await waitFor(() => {
      expect(screen.getByText("Confirmer")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Confirmer"));

    await waitFor(() => {
      expect(mockSwitchProvider).toHaveBeenCalledWith("IIdentityProviderAdapter", "keycloak");
    });
  });

  it("should show description text", async () => {
    setupMocks();
    render(<ProvidersConfigPage />);

    await waitFor(() => {
      expect(screen.getByText(/Gerez les fournisseurs API externes/)).toBeInTheDocument();
    });
  });
});
