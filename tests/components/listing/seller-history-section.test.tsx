import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SellerHistorySection } from "@/components/listing/seller-history-section";

const mockFetchSellerHistoryReport = vi.fn();
vi.mock("@/lib/api/history-api", () => ({
  fetchSellerHistoryReport: (...args: unknown[]) => mockFetchSellerHistoryReport(...args),
}));

const MOCK_REPORT_DATA = {
  vin: "VF1RFB00X56789012",
  ownerCount: 2,
  firstRegistrationDate: "2018-06-01",
  lastRegistrationDate: "2022-03-15",
  mileageRecords: [],
  accidents: [],
  registrationHistory: [],
  outstandingFinance: false,
  stolen: false,
  totalDamageCount: 0,
  provider: { providerName: "mock", providerVersion: "1.0.0" },
};

describe("SellerHistorySection", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // ─── No existing report ──────────────────────────────────────

  it("should show 'not fetched' state when no existing report", () => {
    render(<SellerHistorySection listingId="listing-1" />);
    expect(screen.getByTestId("report-not-fetched")).toBeInTheDocument();
    expect(screen.getByText("Le rapport sera généré lors de la publication")).toBeInTheDocument();
  });

  it("should show the fetch button", () => {
    render(<SellerHistorySection listingId="listing-1" />);
    expect(screen.getByTestId("fetch-report-btn")).toHaveTextContent(
      "Générer le rapport maintenant",
    );
  });

  it("should call fetchSellerHistoryReport when button clicked", async () => {
    mockFetchSellerHistoryReport.mockResolvedValueOnce({
      reportId: "report-1",
      source: "mock",
      fetchedAt: "2026-02-24T10:00:00.000Z",
      reportVersion: "1.0.0",
      reportData: MOCK_REPORT_DATA,
    });

    const user = userEvent.setup();
    render(<SellerHistorySection listingId="listing-1" />);

    await user.click(screen.getByTestId("fetch-report-btn"));

    expect(mockFetchSellerHistoryReport).toHaveBeenCalledWith("listing-1");
  });

  it("should show report summary after successful fetch", async () => {
    mockFetchSellerHistoryReport.mockResolvedValueOnce({
      reportId: "report-1",
      source: "mock",
      fetchedAt: "2026-02-24T10:00:00.000Z",
      reportVersion: "1.0.0",
      reportData: MOCK_REPORT_DATA,
    });

    const user = userEvent.setup();
    render(<SellerHistorySection listingId="listing-1" />);

    await user.click(screen.getByTestId("fetch-report-btn"));

    expect(screen.getByTestId("report-summary")).toBeInTheDocument();
    expect(screen.getByTestId("report-generated-date")).toHaveTextContent("24/02/2026");
    expect(screen.getByTestId("summary-owners")).toHaveTextContent("2");
    expect(screen.getByTestId("summary-accidents")).toHaveTextContent("0");
  });

  it("should show error when fetch fails", async () => {
    mockFetchSellerHistoryReport.mockRejectedValueOnce(
      new Error("Failed to fetch history report: 400"),
    );

    const user = userEvent.setup();
    render(<SellerHistorySection listingId="listing-1" />);

    await user.click(screen.getByTestId("fetch-report-btn"));

    expect(screen.getByTestId("fetch-error")).toHaveTextContent(
      "Failed to fetch history report: 400",
    );
  });

  // ─── Existing report ─────────────────────────────────────────

  it("should show report summary when existingReport is provided", () => {
    render(
      <SellerHistorySection
        listingId="listing-1"
        existingReport={{
          fetchedAt: "2026-02-24T10:00:00.000Z",
          source: "mock",
          ownerCount: 3,
          accidentCount: 1,
          stolen: false,
          outstandingFinance: false,
        }}
      />,
    );

    expect(screen.getByTestId("report-summary")).toBeInTheDocument();
    expect(screen.getByTestId("summary-owners")).toHaveTextContent("3");
    expect(screen.getByTestId("summary-accidents")).toHaveTextContent("1");
  });

  it("should show stolen badge as destructive when stolen", () => {
    render(
      <SellerHistorySection
        listingId="listing-1"
        existingReport={{
          fetchedAt: "2026-02-24T10:00:00.000Z",
          source: "mock",
          ownerCount: 1,
          accidentCount: 0,
          stolen: true,
          outstandingFinance: false,
        }}
      />,
    );

    expect(screen.getByTestId("summary-stolen")).toHaveTextContent("Signalé");
  });

  it("should show finance badge as destructive when outstanding finance", () => {
    render(
      <SellerHistorySection
        listingId="listing-1"
        existingReport={{
          fetchedAt: "2026-02-24T10:00:00.000Z",
          source: "mock",
          ownerCount: 1,
          accidentCount: 0,
          stolen: false,
          outstandingFinance: true,
        }}
      />,
    );

    expect(screen.getByTestId("summary-finance")).toHaveTextContent("En cours");
  });

  it("should show source in report summary", () => {
    render(
      <SellerHistorySection
        listingId="listing-1"
        existingReport={{
          fetchedAt: "2026-02-24T10:00:00.000Z",
          source: "mock",
          ownerCount: 1,
          accidentCount: 0,
          stolen: false,
          outstandingFinance: false,
        }}
      />,
    );

    expect(screen.getByText("Source : mock")).toBeInTheDocument();
  });

  it("should not show fetch button when report exists", () => {
    render(
      <SellerHistorySection
        listingId="listing-1"
        existingReport={{
          fetchedAt: "2026-02-24T10:00:00.000Z",
          source: "mock",
          ownerCount: 1,
          accidentCount: 0,
          stolen: false,
          outstandingFinance: false,
        }}
      />,
    );

    expect(screen.queryByTestId("fetch-report-btn")).not.toBeInTheDocument();
  });
});
