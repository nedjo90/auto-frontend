import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { HistoryReport } from "@/components/listing/history-report";
import type { HistoryResponse } from "@auto/shared";

describe("HistoryReport", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const fullReport: HistoryResponse = {
    vin: "VF1RFB00X56789012",
    ownerCount: 2,
    firstRegistrationDate: "2018-06-01",
    lastRegistrationDate: "2022-03-15",
    mileageRecords: [
      { date: "2020-06-01", mileageKm: 25000, source: "controle_technique" },
      { date: "2022-06-01", mileageKm: 52000, source: "revision_constructeur" },
    ],
    accidents: [
      { date: "2019-11-05", severity: "minor", description: "Accrochage latéral" },
    ],
    registrationHistory: [
      { date: "2018-06-01", department: "75", region: "Île-de-France" },
      { date: "2022-03-15", department: "69", region: "Auvergne-Rhône-Alpes" },
    ],
    outstandingFinance: false,
    stolen: false,
    totalDamageCount: 1,
    provider: { providerName: "mock", providerVersion: "1.0.0" },
  };

  it("should render the report container", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("history-report")).toBeInTheDocument();
  });

  it("should display the report generation date", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("report-date")).toHaveTextContent("24/02/2026");
  });

  it("should render all five report sections", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("section-ownership")).toBeInTheDocument();
    expect(screen.getByTestId("section-accidents")).toBeInTheDocument();
    expect(screen.getByTestId("section-mileage")).toBeInTheDocument();
    expect(screen.getByTestId("section-registration")).toBeInTheDocument();
    expect(screen.getByTestId("section-status")).toBeInTheDocument();
  });

  // ─── Ownership section ──────────────────────────────────────────

  it("should display owner count", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("owner-count")).toHaveTextContent("2");
  });

  it("should display first and last registration dates", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("first-registration")).toHaveTextContent("01/06/2018");
    expect(screen.getByTestId("last-registration")).toHaveTextContent("15/03/2022");
  });

  // ─── Accidents section ──────────────────────────────────────────

  it("should render accident rows when accidents exist", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("accident-row-0")).toBeInTheDocument();
  });

  it("should show 'Aucun accident signalé' when no accidents", () => {
    const cleanReport: HistoryResponse = { ...fullReport, accidents: [], totalDamageCount: 0 };
    render(
      <HistoryReport
        report={cleanReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("no-accidents")).toHaveTextContent("Aucun accident signalé");
  });

  // ─── Mileage section ────────────────────────────────────────────

  it("should render mileage rows with formatted values", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("mileage-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("mileage-row-1")).toBeInTheDocument();
  });

  it("should show 'Information non disponible' when no mileage records", () => {
    const noMileage: HistoryResponse = { ...fullReport, mileageRecords: [] };
    render(
      <HistoryReport
        report={noMileage}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    const section = screen.getByTestId("section-mileage");
    expect(within(section).getByTestId("section-empty")).toHaveTextContent(
      "Information non disponible",
    );
  });

  // ─── Registration section ───────────────────────────────────────

  it("should render registration history rows", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("registration-row-0")).toBeInTheDocument();
    expect(screen.getByTestId("registration-row-1")).toBeInTheDocument();
  });

  it("should show 'Information non disponible' when no registration history", () => {
    const noReg: HistoryResponse = { ...fullReport, registrationHistory: [] };
    render(
      <HistoryReport
        report={noReg}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    const section = screen.getByTestId("section-registration");
    expect(within(section).getByTestId("section-empty")).toHaveTextContent(
      "Information non disponible",
    );
  });

  // ─── Status section ─────────────────────────────────────────────

  it("should show green indicator for non-stolen vehicle", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("stolen-status")).toHaveTextContent("Véhicule non signalé volé");
  });

  it("should show red indicator for stolen vehicle", () => {
    const stolen: HistoryResponse = { ...fullReport, stolen: true };
    render(
      <HistoryReport
        report={stolen}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("stolen-status")).toHaveTextContent("Véhicule signalé volé");
  });

  it("should show green indicator for no outstanding finance", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("finance-status")).toHaveTextContent("Aucun gage financier");
  });

  it("should show orange indicator for outstanding finance", () => {
    const financed: HistoryResponse = { ...fullReport, outstandingFinance: true };
    render(
      <HistoryReport
        report={financed}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.getByTestId("finance-status")).toHaveTextContent("Gage financier en cours");
  });

  // ─── Certified badges ───────────────────────────────────────────

  it("should display certified badges on each section", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    const badges = screen.getAllByTestId("certified-badge");
    expect(badges.length).toBe(5); // one per section
    for (const badge of badges) {
      expect(badge).toHaveTextContent("Certifié mock");
    }
  });

  // ─── Mock indicator ─────────────────────────────────────────────

  it("should not show mock indicator by default", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );
    expect(screen.queryByTestId("mock-indicator")).not.toBeInTheDocument();
  });

  it("should show mock indicator when isMockData is true", () => {
    render(
      <HistoryReport
        report={fullReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
        isMockData={true}
      />,
    );
    expect(screen.getByTestId("mock-indicator")).toHaveTextContent(
      "Données de démonstration",
    );
  });

  // ─── Empty report ───────────────────────────────────────────────

  it("should handle a report with all empty arrays gracefully", () => {
    const emptyReport: HistoryResponse = {
      vin: "VF1RFB00X56789012",
      ownerCount: 0,
      firstRegistrationDate: "",
      lastRegistrationDate: "",
      mileageRecords: [],
      accidents: [],
      registrationHistory: [],
      outstandingFinance: false,
      stolen: false,
      totalDamageCount: 0,
      provider: { providerName: "mock", providerVersion: "1.0.0" },
    };

    render(
      <HistoryReport
        report={emptyReport}
        source="mock"
        fetchedAt="2026-02-24T10:00:00.000Z"
      />,
    );

    expect(screen.getByTestId("history-report")).toBeInTheDocument();
    expect(screen.getByTestId("no-accidents")).toBeInTheDocument();
    const emptyIndicators = screen.getAllByTestId("section-empty");
    expect(emptyIndicators.length).toBe(2); // mileage + registration
  });
});
