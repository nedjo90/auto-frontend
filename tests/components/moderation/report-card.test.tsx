import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportCard } from "@/components/moderation/report-card";
import type { IReport } from "@auto/shared";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const MOCK_REPORT: IReport = {
  ID: "a0000000-0000-0000-0000-000000000001",
  reporterId: "b0000000-0000-0000-0000-000000000001",
  reporterName: "Jean Dupont",
  targetType: "listing",
  targetId: "c0000000-0000-0000-0000-000000000001",
  targetLabel: "Peugeot 308",
  reasonId: "d0000000-0000-0000-0000-000000000001",
  reasonLabel: "Annonce frauduleuse",
  severity: "high",
  description: "This listing is fraudulent",
  status: "pending",
  assignedTo: null,
  createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  updatedAt: null,
};

describe("ReportCard", () => {
  it("renders report card with target label", () => {
    render(<ReportCard report={MOCK_REPORT} />);
    expect(screen.getByText("Peugeot 308")).toBeInTheDocument();
  });

  it("renders severity badge", () => {
    render(<ReportCard report={MOCK_REPORT} />);
    expect(screen.getByTestId("severity-badge")).toHaveTextContent("high");
  });

  it("renders status badge", () => {
    render(<ReportCard report={MOCK_REPORT} />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent("En attente");
  });

  it("renders reason label", () => {
    render(<ReportCard report={MOCK_REPORT} />);
    expect(screen.getByText("Annonce frauduleuse")).toBeInTheDocument();
  });

  it("renders reporter name", () => {
    render(<ReportCard report={MOCK_REPORT} />);
    expect(screen.getByText(/Jean Dupont/)).toBeInTheDocument();
  });

  it("renders relative date", () => {
    render(<ReportCard report={MOCK_REPORT} />);
    expect(screen.getByText("il y a 1h")).toBeInTheDocument();
  });

  it("links to report detail page", () => {
    render(<ReportCard report={MOCK_REPORT} />);
    const link = screen.getByTestId(`report-card-${MOCK_REPORT.ID}`);
    expect(link).toHaveAttribute("href", `/moderator/reports/${MOCK_REPORT.ID}`);
  });

  it("shows fallback target label for unknown type", () => {
    render(<ReportCard report={{ ...MOCK_REPORT, targetLabel: null }} />);
    expect(screen.getByText("Annonce")).toBeInTheDocument();
  });
});
