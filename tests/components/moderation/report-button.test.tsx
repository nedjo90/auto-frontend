import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportButton } from "@/components/moderation/report-button";

const mockFetchReasons = vi.fn();
const mockSubmitReport = vi.fn();

vi.mock("@/lib/api/moderation-api", () => ({
  fetchReportReasons: (...args: unknown[]) => mockFetchReasons(...args),
  submitReport: (...args: unknown[]) => mockSubmitReport(...args),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

const MOCK_REASONS = [
  { ID: "r1", key: "spam", label: "Spam ou contenu commercial", severity: "low", active: true },
  { ID: "r2", key: "fraud", label: "Annonce frauduleuse", severity: "high", active: true },
];

describe("ReportButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchReasons.mockResolvedValue(MOCK_REASONS);
    mockSubmitReport.mockResolvedValue({
      reportId: "rpt-1",
      status: "pending",
      createdAt: "2026-02-25T00:00:00Z",
    });
  });

  it("renders Signaler button", () => {
    render(<ReportButton targetType="listing" targetId="listing-1" />);
    expect(screen.getByTestId("report-button")).toBeInTheDocument();
    expect(screen.getByText("Signaler")).toBeInTheDocument();
  });

  it("opens report dialog on click", async () => {
    const user = userEvent.setup();
    render(<ReportButton targetType="listing" targetId="listing-1" />);

    await user.click(screen.getByTestId("report-button"));

    await waitFor(() => {
      expect(screen.getByTestId("report-dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("Signaler un contenu")).toBeInTheDocument();
  });

  it("fetches report reasons when dialog opens", async () => {
    const user = userEvent.setup();
    render(<ReportButton targetType="listing" targetId="listing-1" />);

    await user.click(screen.getByTestId("report-button"));

    await waitFor(() => {
      expect(mockFetchReasons).toHaveBeenCalled();
    });
  });

  it("shows submit button disabled when form is incomplete", async () => {
    const user = userEvent.setup();
    render(<ReportButton targetType="listing" targetId="listing-1" />);

    await user.click(screen.getByTestId("report-button"));

    await waitFor(() => {
      expect(screen.getByTestId("report-submit")).toBeInTheDocument();
    });
    expect(screen.getByTestId("report-submit")).toBeDisabled();
  });

  it("shows success message after submitting", async () => {
    const user = userEvent.setup();
    render(<ReportButton targetType="listing" targetId="listing-1" />);

    await user.click(screen.getByTestId("report-button"));

    await waitFor(() => {
      expect(screen.getByTestId("report-dialog")).toBeInTheDocument();
    });

    // Fill in description
    const textarea = screen.getByTestId("report-description");
    await user.type(
      textarea,
      "This listing is fraudulent and contains misleading information about the vehicle.",
    );

    // Select a reason (click the select trigger, then pick an option)
    await user.click(screen.getByTestId("report-reason-select"));
    await waitFor(() => {
      expect(screen.getByText("Annonce frauduleuse")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Annonce frauduleuse"));

    // Submit
    await user.click(screen.getByTestId("report-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("report-success")).toBeInTheDocument();
    });
    expect(screen.getByText("Votre signalement a été enregistré")).toBeInTheDocument();
  });

  it("shows error message on submission failure", async () => {
    mockSubmitReport.mockRejectedValue(new Error("Rate limit exceeded"));
    const user = userEvent.setup();
    render(<ReportButton targetType="listing" targetId="listing-1" />);

    await user.click(screen.getByTestId("report-button"));

    await waitFor(() => {
      expect(screen.getByTestId("report-dialog")).toBeInTheDocument();
    });

    const textarea = screen.getByTestId("report-description");
    await user.type(textarea, "This listing is fraudulent and misleading content.");

    await user.click(screen.getByTestId("report-reason-select"));
    await waitFor(() => {
      expect(screen.getByText("Spam ou contenu commercial")).toBeInTheDocument();
    });
    await user.click(screen.getByText("Spam ou contenu commercial"));

    await user.click(screen.getByTestId("report-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("report-error")).toBeInTheDocument();
    });
    expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
  });
});
