import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetchAuditTrailEntries = vi.fn();
const mockExportAuditTrailCsv = vi.fn();

vi.mock("@/lib/api/audit-api", () => ({
  fetchAuditTrailEntries: (...args: unknown[]) => mockFetchAuditTrailEntries(...args),
  exportAuditTrailCsv: (...args: unknown[]) => mockExportAuditTrailCsv(...args),
}));

import AuditTrailPage from "@/app/(dashboard)/admin/audit-trail/page";
import type { IAuditTrailEntry } from "@auto/shared";

const mockEntries: IAuditTrailEntry[] = [
  {
    ID: "at-1",
    action: "config.update",
    actorId: "user-abc-12345678",
    actorRole: "admin",
    targetType: "ConfigParameter",
    targetId: "param-xyz-12345678",
    timestamp: "2026-02-11T10:30:00Z",
    details: JSON.stringify({ key: "max_photos", oldValue: "10", newValue: "15" }),
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
    requestId: "req-001",
    severity: "info",
  },
  {
    ID: "at-2",
    action: "user.delete",
    actorId: "admin-def-87654321",
    actorRole: "superadmin",
    targetType: "User",
    targetId: null,
    timestamp: "2026-02-11T11:00:00Z",
    details: null,
    ipAddress: null,
    userAgent: null,
    requestId: null,
    severity: "critical",
  },
];

describe("AuditTrailPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetchAuditTrailEntries.mockImplementation(() => new Promise(() => {}));
    render(<AuditTrailPage />);
    expect(screen.getByTestId("audit-loading")).toBeInTheDocument();
  });

  it("should render page title and description", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByText("Piste d'audit")).toBeInTheDocument();
      expect(screen.getByText(/Suivi de toutes les operations/)).toBeInTheDocument();
    });
  });

  it("should render audit entries in table", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("audit-row-at-1")).toBeInTheDocument();
      expect(screen.getByTestId("audit-row-at-2")).toBeInTheDocument();
    });
  });

  it("should display action codes", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByText("config.update")).toBeInTheDocument();
      expect(screen.getByText("user.delete")).toBeInTheDocument();
    });
  });

  it("should display severity badges", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByText("info")).toBeInTheDocument();
      expect(screen.getByText("critical")).toBeInTheDocument();
    });
  });

  it("should show empty state when no entries", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: [], count: 0 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("audit-empty")).toBeInTheDocument();
    });
  });

  it("should show error message on fetch failure", async () => {
    mockFetchAuditTrailEntries.mockRejectedValue(new Error("Network error"));
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("audit-error")).toHaveTextContent("Network error");
    });
  });

  it("should display total count in pagination", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByText("2 entrees au total")).toBeInTheDocument();
    });
  });

  it("should have pagination controls", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("prev-page-btn")).toBeInTheDocument();
      expect(screen.getByTestId("next-page-btn")).toBeInTheDocument();
      expect(screen.getByTestId("page-size-select")).toBeInTheDocument();
    });
  });

  it("should have an export CSV button", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: [], count: 0 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("export-csv-btn")).toBeInTheDocument();
    });
  });

  it("should have a link to API calls page", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: [], count: 0 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("api-calls-link")).toBeInTheDocument();
    });
  });

  it("should have filter controls", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: [], count: 0 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("audit-filters")).toBeInTheDocument();
      expect(screen.getByTestId("filter-date-from")).toBeInTheDocument();
      expect(screen.getByTestId("filter-date-to")).toBeInTheDocument();
      expect(screen.getByTestId("filter-action")).toBeInTheDocument();
      expect(screen.getByTestId("filter-actor")).toBeInTheDocument();
      expect(screen.getByTestId("filter-severity")).toBeInTheDocument();
      expect(screen.getByTestId("apply-filters-btn")).toBeInTheDocument();
      expect(screen.getByTestId("reset-filters-btn")).toBeInTheDocument();
    });
  });

  it("should have sortable column headers", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: [], count: 0 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("sort-timestamp")).toBeInTheDocument();
      expect(screen.getByTestId("sort-action")).toBeInTheDocument();
      expect(screen.getByTestId("sort-severity")).toBeInTheDocument();
    });
  });

  it("should expand row to show details on click", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    const user = userEvent.setup();
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("audit-row-at-1")).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("audit-row-at-1"));
    expect(screen.getByTestId("audit-detail-at-1")).toBeInTheDocument();
    expect(screen.getByText(/192\.168\.1\.1/)).toBeInTheDocument();
  });

  it("should collapse expanded row on second click", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    const user = userEvent.setup();
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("audit-row-at-1")).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("audit-row-at-1"));
    expect(screen.getByTestId("audit-detail-at-1")).toBeInTheDocument();
    await user.click(screen.getByTestId("audit-row-at-1"));
    expect(screen.queryByTestId("audit-detail-at-1")).not.toBeInTheDocument();
  });

  it("should handle sorting toggle", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    const user = userEvent.setup();
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByTestId("sort-timestamp")).toBeInTheDocument();
    });

    // Click sort-timestamp - default is desc, so second call should be asc
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: mockEntries, count: 2 });
    await user.click(screen.getByTestId("sort-timestamp"));
    await waitFor(() => {
      // Should be called again with new sort order
      expect(mockFetchAuditTrailEntries).toHaveBeenCalledTimes(2);
    });
  });

  it("should display 1 entree for singular count", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: [mockEntries[0]], count: 1 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(screen.getByText("1 entree au total")).toBeInTheDocument();
    });
  });

  it("should fetch with default ordering on mount", async () => {
    mockFetchAuditTrailEntries.mockResolvedValue({ entries: [], count: 0 });
    render(<AuditTrailPage />);
    await waitFor(() => {
      expect(mockFetchAuditTrailEntries).toHaveBeenCalledWith({}, "timestamp desc", 25, 0);
    });
  });
});
