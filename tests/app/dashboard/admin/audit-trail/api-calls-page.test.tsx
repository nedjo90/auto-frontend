import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockFetchApiCallLogs = vi.fn();
const mockExportApiCallLogsCsv = vi.fn();

vi.mock("@/lib/api/audit-api", () => ({
  fetchApiCallLogs: (...args: unknown[]) => mockFetchApiCallLogs(...args),
  exportApiCallLogsCsv: (...args: unknown[]) => mockExportApiCallLogsCsv(...args),
}));

import ApiCallLogPage from "@/app/(dashboard)/admin/audit-trail/api-calls/page";
import type { IApiCallLog } from "@auto/shared";

const mockLogs: IApiCallLog[] = [
  {
    ID: "log-1",
    adapterInterface: "GeocodingAdapter",
    providerKey: "mapbox",
    endpoint: "https://api.mapbox.com/geocoding/v5/mapbox.places",
    httpMethod: "GET",
    httpStatus: 200,
    responseTimeMs: 145,
    cost: 0.0025,
    listingId: "lst-001",
    requestId: "req-001",
    errorMessage: null,
    timestamp: "2026-02-11T10:30:00Z",
  },
  {
    ID: "log-2",
    adapterInterface: "ValuationAdapter",
    providerKey: "argus",
    endpoint: "https://api.argus.fr/v2/valuations",
    httpMethod: "POST",
    httpStatus: 500,
    responseTimeMs: 3200,
    cost: 0.015,
    listingId: null,
    requestId: "req-002",
    errorMessage: "Internal Server Error",
    timestamp: "2026-02-11T11:00:00Z",
  },
];

describe("ApiCallLogPage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should show loading state initially", () => {
    mockFetchApiCallLogs.mockImplementation(() => new Promise(() => {}));
    render(<ApiCallLogPage />);
    expect(screen.getByTestId("api-log-loading")).toBeInTheDocument();
  });

  it("should render page title and description", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByText("Journal des appels API")).toBeInTheDocument();
      expect(screen.getByText(/Suivi des appels aux fournisseurs/)).toBeInTheDocument();
    });
  });

  it("should render API call log entries in table", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByTestId("api-log-row-log-1")).toBeInTheDocument();
      expect(screen.getByTestId("api-log-row-log-2")).toBeInTheDocument();
    });
  });

  it("should display adapter and provider info", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByText("GeocodingAdapter")).toBeInTheDocument();
      expect(screen.getByText("mapbox")).toBeInTheDocument();
      expect(screen.getByText("ValuationAdapter")).toBeInTheDocument();
      expect(screen.getByText("argus")).toBeInTheDocument();
    });
  });

  it("should display HTTP status badges", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByText("200")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
    });
  });

  it("should display response times", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByText("145")).toBeInTheDocument();
      expect(screen.getByText("3200")).toBeInTheDocument();
    });
  });

  it("should display costs formatted to 4 decimals", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByText("0.0025")).toBeInTheDocument();
      expect(screen.getByText("0.0150")).toBeInTheDocument();
    });
  });

  it("should display error message when present", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByText("Internal Server Error")).toBeInTheDocument();
    });
  });

  it("should show empty state when no logs", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: [], count: 0 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByTestId("api-log-empty")).toBeInTheDocument();
    });
  });

  it("should show error message on fetch failure", async () => {
    mockFetchApiCallLogs.mockRejectedValue(new Error("Network error"));
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByTestId("api-log-error")).toHaveTextContent("Network error");
    });
  });

  it("should display total count in pagination", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByText("2 appels au total")).toBeInTheDocument();
    });
  });

  it("should have pagination controls", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByTestId("prev-page-btn")).toBeInTheDocument();
      expect(screen.getByTestId("next-page-btn")).toBeInTheDocument();
      expect(screen.getByTestId("page-size-select")).toBeInTheDocument();
    });
  });

  it("should have an export CSV button", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: [], count: 0 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByTestId("export-csv-btn")).toBeInTheDocument();
    });
  });

  it("should have filter controls", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: [], count: 0 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByTestId("api-log-filters")).toBeInTheDocument();
      expect(screen.getByTestId("filter-date-from")).toBeInTheDocument();
      expect(screen.getByTestId("filter-date-to")).toBeInTheDocument();
      expect(screen.getByTestId("filter-provider")).toBeInTheDocument();
      expect(screen.getByTestId("filter-adapter")).toBeInTheDocument();
      expect(screen.getByTestId("filter-listing-id")).toBeInTheDocument();
      expect(screen.getByTestId("apply-filters-btn")).toBeInTheDocument();
      expect(screen.getByTestId("reset-filters-btn")).toBeInTheDocument();
    });
  });

  it("should have sortable column headers", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: [], count: 0 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByTestId("sort-timestamp")).toBeInTheDocument();
      expect(screen.getByTestId("sort-provider")).toBeInTheDocument();
      expect(screen.getByTestId("sort-status")).toBeInTheDocument();
      expect(screen.getByTestId("sort-response-time")).toBeInTheDocument();
      expect(screen.getByTestId("sort-cost")).toBeInTheDocument();
    });
  });

  it("should have a back link to audit trail page", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: [], count: 0 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByText("Piste d'audit")).toBeInTheDocument();
    });
  });

  it("should handle sorting toggle", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    const user = userEvent.setup();
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByTestId("sort-cost")).toBeInTheDocument();
    });

    mockFetchApiCallLogs.mockResolvedValue({ entries: mockLogs, count: 2 });
    await user.click(screen.getByTestId("sort-cost"));
    await waitFor(() => {
      expect(mockFetchApiCallLogs).toHaveBeenCalledTimes(2);
    });
  });

  it("should display singular appel for count of 1", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: [mockLogs[0]], count: 1 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(screen.getByText("1 appel au total")).toBeInTheDocument();
    });
  });

  it("should fetch with default ordering on mount", async () => {
    mockFetchApiCallLogs.mockResolvedValue({ entries: [], count: 0 });
    render(<ApiCallLogPage />);
    await waitFor(() => {
      expect(mockFetchApiCallLogs).toHaveBeenCalledWith({}, "timestamp desc", 25, 0);
    });
  });
});
