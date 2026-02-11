import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetchConfigEntities = vi.fn();
const mockCreateConfigEntity = vi.fn();
const mockUpdateConfigEntity = vi.fn();

vi.mock("@/lib/api/config-api", () => ({
  fetchConfigEntities: (...args: unknown[]) => mockFetchConfigEntities(...args),
  createConfigEntity: (...args: unknown[]) => mockCreateConfigEntity(...args),
  updateConfigEntity: (...args: unknown[]) => mockUpdateConfigEntity(...args),
}));

import AlertsConfigPage from "@/app/(dashboard)/admin/alerts/page";

const mockAlerts = [
  {
    ID: "a1",
    name: "Marge critique",
    metric: "margin_per_listing",
    thresholdValue: 8,
    comparisonOperator: "below",
    notificationMethod: "both",
    severityLevel: "critical",
    enabled: true,
    cooldownMinutes: 30,
    lastTriggeredAt: null,
    createdAt: "2026-02-11T00:00:00Z",
    createdBy: "admin",
    modifiedAt: "2026-02-11T00:00:00Z",
    modifiedBy: "admin",
  },
  {
    ID: "a2",
    name: "API faible",
    metric: "api_availability",
    thresholdValue: 95,
    comparisonOperator: "below",
    notificationMethod: "in_app",
    severityLevel: "warning",
    enabled: false,
    cooldownMinutes: 60,
    lastTriggeredAt: "2026-02-10T12:00:00Z",
    createdAt: "2026-02-11T00:00:00Z",
    createdBy: "admin",
    modifiedAt: "2026-02-11T00:00:00Z",
    modifiedBy: "admin",
  },
];

describe("AlertsConfigPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetchConfigEntities.mockImplementation(() => new Promise(() => {}));
    render(<AlertsConfigPage />);
    expect(screen.getByTestId("alerts-loading")).toBeInTheDocument();
  });

  it("should render page title and description", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockAlerts);
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByText("Alertes")).toBeInTheDocument();
      expect(screen.getByText(/Configurez les alertes/)).toBeInTheDocument();
    });
  });

  it("should render alert table with data", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockAlerts);
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByText("Marge critique")).toBeInTheDocument();
      expect(screen.getByText("API faible")).toBeInTheDocument();
    });
  });

  it("should display severity badges", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockAlerts);
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByText("Critique")).toBeInTheDocument();
      expect(screen.getByText("Warning")).toBeInTheDocument();
    });
  });

  it("should show enabled/disabled status", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockAlerts);
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByText("Actif")).toBeInTheDocument();
      expect(screen.getByText("Inactif")).toBeInTheDocument();
    });
  });

  it("should show empty state when no alerts", async () => {
    mockFetchConfigEntities.mockResolvedValue([]);
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByTestId("alerts-empty")).toBeInTheDocument();
    });
  });

  it("should show error message on fetch failure", async () => {
    mockFetchConfigEntities.mockRejectedValue(new Error("Network error"));
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByTestId("alerts-error")).toHaveTextContent("Network error");
    });
  });

  it("should have a create alert button", async () => {
    mockFetchConfigEntities.mockResolvedValue([]);
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByTestId("create-alert-btn")).toBeInTheDocument();
    });
  });

  it("should open form dialog when create button clicked", async () => {
    mockFetchConfigEntities.mockResolvedValue([]);
    const user = userEvent.setup();
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByTestId("create-alert-btn")).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("create-alert-btn"));
    expect(screen.getByText("Configurez une nouvelle alerte de seuil.")).toBeInTheDocument();
  });

  it("should toggle alert enabled state", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockAlerts);
    mockUpdateConfigEntity.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByTestId("alert-toggle-a1")).toBeInTheDocument();
    });

    // After toggle, reload alerts
    mockFetchConfigEntities.mockResolvedValue(
      mockAlerts.map((a) => (a.ID === "a1" ? { ...a, enabled: false } : a)),
    );

    await user.click(screen.getByTestId("alert-toggle-a1"));
    await waitFor(() => {
      expect(mockUpdateConfigEntity).toHaveBeenCalledWith("ConfigAlerts", "a1", { enabled: false });
    });
  });

  it("should open edit dialog when edit button clicked", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockAlerts);
    const user = userEvent.setup();
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByTestId("alert-edit-a1")).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("alert-edit-a1"));
    expect(screen.getByText("Modifier l'alerte")).toBeInTheDocument();
  });

  it("should display threshold with operator", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockAlerts);
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(screen.getByText(/< 8/)).toBeInTheDocument();
      expect(screen.getByText(/< 95/)).toBeInTheDocument();
    });
  });

  it("should display last triggered date when available", async () => {
    mockFetchConfigEntities.mockResolvedValue(mockAlerts);
    render(<AlertsConfigPage />);
    await waitFor(() => {
      // a2 has lastTriggeredAt, a1 shows "-"
      const dashes = screen.getAllByText("-");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("should fetch ConfigAlerts entity", async () => {
    mockFetchConfigEntities.mockResolvedValue([]);
    render(<AlertsConfigPage />);
    await waitFor(() => {
      expect(mockFetchConfigEntities).toHaveBeenCalledWith("ConfigAlerts");
    });
  });
});
