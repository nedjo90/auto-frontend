import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PatternAlert } from "@/components/moderation/pattern-alert";
import type { IViolationPattern } from "@auto/shared";

const mockDeactivateAccount = vi.fn();

vi.mock("@/lib/api/moderation-api", () => ({
  deactivateAccount: (...args: unknown[]) => mockDeactivateAccount(...args),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

const SELLER_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const onActionComplete = vi.fn();

const WARNING_PATTERN: IViolationPattern = {
  type: "frequentReports",
  description: "3 signalements en 30 jours",
  count: 3,
  period: "30j",
  severity: "warning",
};

const CRITICAL_PATTERN: IViolationPattern = {
  type: "repeatOffender",
  description: "2 suspensions de compte au total",
  count: 2,
  period: null,
  severity: "critical",
};

const INFO_PATTERN: IViolationPattern = {
  type: "sameReasonPattern",
  description: "Meme motif de signalement 3 fois en 90 jours",
  count: 3,
  period: "90j",
  severity: "warning",
};

describe("PatternAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when no patterns", () => {
    const { container } = render(
      <PatternAlert patterns={[]} sellerId={SELLER_ID} onActionComplete={onActionComplete} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders warning pattern with correct styling", () => {
    render(
      <PatternAlert
        patterns={[WARNING_PATTERN]}
        sellerId={SELLER_ID}
        onActionComplete={onActionComplete}
      />,
    );

    expect(screen.getByTestId("pattern-frequentReports")).toBeDefined();
    expect(screen.getByText("3 signalements en 30 jours")).toBeDefined();
    expect(screen.getByText("Periode: 30j")).toBeDefined();
  });

  it("renders same-reason pattern with period", () => {
    render(
      <PatternAlert
        patterns={[INFO_PATTERN]}
        sellerId={SELLER_ID}
        onActionComplete={onActionComplete}
      />,
    );

    expect(screen.getByTestId("pattern-sameReasonPattern")).toBeDefined();
    expect(screen.getByText("Periode: 90j")).toBeDefined();
  });

  it("renders multiple patterns", () => {
    render(
      <PatternAlert
        patterns={[WARNING_PATTERN, CRITICAL_PATTERN]}
        sellerId={SELLER_ID}
        onActionComplete={onActionComplete}
      />,
    );

    expect(screen.getByTestId("pattern-frequentReports")).toBeDefined();
    expect(screen.getByTestId("pattern-repeatOffender")).toBeDefined();
  });

  it("shows escalation prompt for critical patterns", () => {
    render(
      <PatternAlert
        patterns={[CRITICAL_PATTERN]}
        sellerId={SELLER_ID}
        onActionComplete={onActionComplete}
      />,
    );

    expect(screen.getByTestId("escalation-prompt")).toBeDefined();
    expect(screen.getByTestId("escalation-button")).toBeDefined();
    expect(screen.getByText(/Ce vendeur presente un historique problematique/)).toBeDefined();
  });

  it("does not show escalation for non-critical patterns only", () => {
    render(
      <PatternAlert
        patterns={[WARNING_PATTERN]}
        sellerId={SELLER_ID}
        onActionComplete={onActionComplete}
      />,
    );

    expect(screen.queryByTestId("escalation-prompt")).toBeNull();
  });

  it("opens escalation dialog on button click", async () => {
    const user = userEvent.setup();
    render(
      <PatternAlert
        patterns={[CRITICAL_PATTERN]}
        sellerId={SELLER_ID}
        onActionComplete={onActionComplete}
      />,
    );

    await user.click(screen.getByTestId("escalation-button"));

    await waitFor(() => {
      expect(screen.getByTestId("escalation-dialog")).toBeDefined();
    });
    expect(screen.getByTestId("escalation-reason")).toBeDefined();
    expect(screen.getByTestId("escalation-confirm-checkbox")).toBeDefined();
  });

  it("disables submit until confirmation checkbox checked", async () => {
    const user = userEvent.setup();
    render(
      <PatternAlert
        patterns={[CRITICAL_PATTERN]}
        sellerId={SELLER_ID}
        onActionComplete={onActionComplete}
      />,
    );

    await user.click(screen.getByTestId("escalation-button"));

    await waitFor(() => {
      expect(screen.getByTestId("escalation-submit")).toBeDefined();
    });

    // Should be disabled without checkbox
    expect((screen.getByTestId("escalation-submit") as HTMLButtonElement).disabled).toBe(true);

    // Check checkbox
    await user.click(screen.getByTestId("escalation-confirm-checkbox"));

    expect((screen.getByTestId("escalation-submit") as HTMLButtonElement).disabled).toBe(false);
  });

  it("calls deactivateAccount on escalation submit", async () => {
    const user = userEvent.setup();
    mockDeactivateAccount.mockResolvedValue({ success: true, actionId: "a1", message: "OK" });
    render(
      <PatternAlert
        patterns={[CRITICAL_PATTERN]}
        sellerId={SELLER_ID}
        onActionComplete={onActionComplete}
      />,
    );

    await user.click(screen.getByTestId("escalation-button"));

    await waitFor(() => {
      expect(screen.getByTestId("escalation-dialog")).toBeDefined();
    });

    await user.click(screen.getByTestId("escalation-confirm-checkbox"));
    await user.click(screen.getByTestId("escalation-submit"));

    await waitFor(() => {
      expect(mockDeactivateAccount).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: SELLER_ID,
          confirmed: true,
        }),
      );
      // Should NOT include reportId (escalation from seller history has no report context)
      expect(mockDeactivateAccount.mock.calls[0][0]).not.toHaveProperty("reportId");
    });

    await waitFor(() => {
      expect(onActionComplete).toHaveBeenCalled();
    });
  });

  it("shows error on escalation failure", async () => {
    const user = userEvent.setup();
    mockDeactivateAccount.mockRejectedValue(new Error("Erreur serveur"));
    render(
      <PatternAlert
        patterns={[CRITICAL_PATTERN]}
        sellerId={SELLER_ID}
        onActionComplete={onActionComplete}
      />,
    );

    await user.click(screen.getByTestId("escalation-button"));

    await waitFor(() => {
      expect(screen.getByTestId("escalation-dialog")).toBeDefined();
    });

    await user.click(screen.getByTestId("escalation-confirm-checkbox"));
    await user.click(screen.getByTestId("escalation-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("escalation-error")).toBeDefined();
    });
    expect(screen.getByText("Erreur serveur")).toBeDefined();
  });
});
