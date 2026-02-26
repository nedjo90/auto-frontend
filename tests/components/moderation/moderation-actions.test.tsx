import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModerationActions } from "@/components/moderation/moderation-actions";
import type { IReportDetail } from "@auto/shared";

const mockDeactivateListing = vi.fn();
const mockSendWarning = vi.fn();
const mockDeactivateAccount = vi.fn();
const mockReactivateListing = vi.fn();
const mockReactivateAccount = vi.fn();
const mockDismissReport = vi.fn();

vi.mock("@/lib/api/moderation-api", () => ({
  deactivateListing: (...args: unknown[]) => mockDeactivateListing(...args),
  sendWarning: (...args: unknown[]) => mockSendWarning(...args),
  deactivateAccount: (...args: unknown[]) => mockDeactivateAccount(...args),
  reactivateListing: (...args: unknown[]) => mockReactivateListing(...args),
  reactivateAccount: (...args: unknown[]) => mockReactivateAccount(...args),
  dismissReport: (...args: unknown[]) => mockDismissReport(...args),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

const BASE_DETAIL: IReportDetail = {
  ID: "a0000000-0000-0000-0000-000000000001",
  reporterId: "b1",
  reporterName: "Jean Dupont",
  reporterEmail: "jean@test.com",
  targetType: "listing",
  targetId: "c1",
  targetLabel: null,
  reasonId: "d1",
  reasonLabel: "Fraude",
  severity: "high",
  description: "Fraudulent listing",
  status: "in_progress",
  assignedTo: "mod-1",
  createdAt: "2026-02-20T10:00:00.000Z",
  updatedAt: null,
  targetData: JSON.stringify({ sellerId: "seller-1", status: "published" }),
  relatedReportsCount: 0,
};

const USER_DETAIL: IReportDetail = {
  ...BASE_DETAIL,
  targetType: "user",
  targetId: "u1",
  targetData: JSON.stringify({ status: "active" }),
};

const SUSPENDED_LISTING_DETAIL: IReportDetail = {
  ...BASE_DETAIL,
  targetData: JSON.stringify({ sellerId: "seller-1", status: "suspended" }),
};

const SUSPENDED_USER_DETAIL: IReportDetail = {
  ...BASE_DETAIL,
  targetType: "user",
  targetId: "u1",
  targetData: JSON.stringify({ status: "suspended" }),
};

describe("ModerationActions", () => {
  const onActionComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Button visibility ──────────────────────────────────────────────

  it("shows deactivate listing, warning and dismiss for listing target", () => {
    render(<ModerationActions detail={BASE_DETAIL} onActionComplete={onActionComplete} />);

    expect(screen.getByTestId("action-deactivate-listing")).toBeInTheDocument();
    expect(screen.getByTestId("action-warning")).toBeInTheDocument();
    expect(screen.getByTestId("action-dismiss")).toBeInTheDocument();
    expect(screen.queryByTestId("action-deactivate-account")).not.toBeInTheDocument();
    expect(screen.queryByTestId("action-reactivate-listing")).not.toBeInTheDocument();
  });

  it("shows warning, deactivate account and dismiss for user target", () => {
    render(<ModerationActions detail={USER_DETAIL} onActionComplete={onActionComplete} />);

    expect(screen.getByTestId("action-warning")).toBeInTheDocument();
    expect(screen.getByTestId("action-deactivate-account")).toBeInTheDocument();
    expect(screen.getByTestId("action-dismiss")).toBeInTheDocument();
    expect(screen.queryByTestId("action-deactivate-listing")).not.toBeInTheDocument();
    expect(screen.queryByTestId("action-reactivate-account")).not.toBeInTheDocument();
  });

  it("shows reactivate listing button for suspended listing target", () => {
    render(
      <ModerationActions detail={SUSPENDED_LISTING_DETAIL} onActionComplete={onActionComplete} />,
    );

    expect(screen.getByTestId("action-reactivate-listing")).toBeInTheDocument();
    expect(screen.queryByTestId("action-deactivate-listing")).not.toBeInTheDocument();
    expect(screen.getByTestId("action-warning")).toBeInTheDocument();
    expect(screen.getByTestId("action-dismiss")).toBeInTheDocument();
  });

  it("shows reactivate account button for suspended user target", () => {
    render(
      <ModerationActions detail={SUSPENDED_USER_DETAIL} onActionComplete={onActionComplete} />,
    );

    expect(screen.getByTestId("action-reactivate-account")).toBeInTheDocument();
    expect(screen.queryByTestId("action-deactivate-account")).not.toBeInTheDocument();
    expect(screen.getByTestId("action-warning")).toBeInTheDocument();
    expect(screen.getByTestId("action-dismiss")).toBeInTheDocument();
  });

  it("shows closed message for treated report", () => {
    render(
      <ModerationActions
        detail={{ ...BASE_DETAIL, status: "treated" }}
        onActionComplete={onActionComplete}
      />,
    );

    expect(screen.getByText(/traite/i)).toBeInTheDocument();
    expect(screen.queryByTestId("action-dismiss")).not.toBeInTheDocument();
  });

  it("shows closed message for dismissed report", () => {
    render(
      <ModerationActions
        detail={{ ...BASE_DETAIL, status: "dismissed" }}
        onActionComplete={onActionComplete}
      />,
    );

    expect(screen.getByText(/rejete/i)).toBeInTheDocument();
    expect(screen.queryByTestId("action-dismiss")).not.toBeInTheDocument();
  });

  // ─── Deactivate listing flow ────────────────────────────────────────

  it("opens dialog and deactivates listing", async () => {
    mockDeactivateListing.mockResolvedValue({ success: true, actionId: "a1", message: "ok" });
    const user = userEvent.setup();

    render(<ModerationActions detail={BASE_DETAIL} onActionComplete={onActionComplete} />);

    await user.click(screen.getByTestId("action-deactivate-listing"));
    expect(screen.getByTestId("action-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("action-reason")).toBeInTheDocument();

    await user.click(screen.getByTestId("action-confirm"));

    await waitFor(() => {
      expect(mockDeactivateListing).toHaveBeenCalledWith({
        reportId: BASE_DETAIL.ID,
        listingId: BASE_DETAIL.targetId,
        reason: undefined,
      });
    });
    expect(onActionComplete).toHaveBeenCalled();
  });

  it("sends reason when provided for listing deactivation", async () => {
    mockDeactivateListing.mockResolvedValue({ success: true, actionId: "a1", message: "ok" });
    const user = userEvent.setup();

    render(<ModerationActions detail={BASE_DETAIL} onActionComplete={onActionComplete} />);

    await user.click(screen.getByTestId("action-deactivate-listing"));
    await user.type(screen.getByTestId("action-reason"), "Fraudulent photos");
    await user.click(screen.getByTestId("action-confirm"));

    await waitFor(() => {
      expect(mockDeactivateListing).toHaveBeenCalledWith(
        expect.objectContaining({ reason: "Fraudulent photos" }),
      );
    });
  });

  // ─── Warning flow ──────────────────────────────────────────────────

  it("sends warning to user target", async () => {
    mockSendWarning.mockResolvedValue({ success: true, actionId: "a2", message: "ok" });
    const user = userEvent.setup();

    render(<ModerationActions detail={USER_DETAIL} onActionComplete={onActionComplete} />);

    await user.click(screen.getByTestId("action-warning"));
    await user.type(screen.getByTestId("action-reason"), "Please follow rules");
    await user.click(screen.getByTestId("action-confirm"));

    await waitFor(() => {
      expect(mockSendWarning).toHaveBeenCalledWith({
        reportId: USER_DETAIL.ID,
        userId: USER_DETAIL.targetId,
        warningMessage: "Please follow rules",
      });
    });
    expect(onActionComplete).toHaveBeenCalled();
  });

  it("sends warning to listing seller using sellerId from targetData", async () => {
    mockSendWarning.mockResolvedValue({ success: true, actionId: "a2", message: "ok" });
    const user = userEvent.setup();

    render(<ModerationActions detail={BASE_DETAIL} onActionComplete={onActionComplete} />);

    await user.click(screen.getByTestId("action-warning"));
    await user.click(screen.getByTestId("action-confirm"));

    await waitFor(() => {
      expect(mockSendWarning).toHaveBeenCalledWith({
        reportId: BASE_DETAIL.ID,
        userId: "seller-1",
        warningMessage: undefined,
      });
    });
    expect(onActionComplete).toHaveBeenCalled();
  });

  // ─── Deactivate account flow ────────────────────────────────────────

  it("requires confirmation checkbox for account deactivation", async () => {
    const user = userEvent.setup();

    render(<ModerationActions detail={USER_DETAIL} onActionComplete={onActionComplete} />);

    await user.click(screen.getByTestId("action-deactivate-account"));
    expect(screen.getByTestId("confirm-checkbox")).toBeInTheDocument();

    // Confirm button should be disabled without checkbox
    expect(screen.getByTestId("action-confirm")).toBeDisabled();
  });

  it("deactivates account after confirmation", async () => {
    mockDeactivateAccount.mockResolvedValue({ success: true, actionId: "a3", message: "ok" });
    const user = userEvent.setup();

    render(<ModerationActions detail={USER_DETAIL} onActionComplete={onActionComplete} />);

    await user.click(screen.getByTestId("action-deactivate-account"));
    await user.click(screen.getByTestId("confirm-checkbox"));
    await user.click(screen.getByTestId("action-confirm"));

    await waitFor(() => {
      expect(mockDeactivateAccount).toHaveBeenCalledWith({
        reportId: USER_DETAIL.ID,
        userId: USER_DETAIL.targetId,
        reason: undefined,
        confirmed: true,
      });
    });
    expect(onActionComplete).toHaveBeenCalled();
  });

  // ─── Reactivate listing flow ─────────────────────────────────────────

  it("reactivates a suspended listing", async () => {
    mockReactivateListing.mockResolvedValue({ success: true, actionId: "a5", message: "ok" });
    const user = userEvent.setup();

    render(
      <ModerationActions detail={SUSPENDED_LISTING_DETAIL} onActionComplete={onActionComplete} />,
    );

    await user.click(screen.getByTestId("action-reactivate-listing"));
    expect(screen.getByTestId("action-dialog")).toBeInTheDocument();

    await user.type(screen.getByTestId("action-reason"), "Verified content");
    await user.click(screen.getByTestId("action-confirm"));

    await waitFor(() => {
      expect(mockReactivateListing).toHaveBeenCalledWith({
        listingId: SUSPENDED_LISTING_DETAIL.targetId,
        reason: "Verified content",
      });
    });
    expect(onActionComplete).toHaveBeenCalled();
  });

  // ─── Reactivate account flow ─────────────────────────────────────────

  it("reactivates a suspended user account", async () => {
    mockReactivateAccount.mockResolvedValue({ success: true, actionId: "a6", message: "ok" });
    const user = userEvent.setup();

    render(
      <ModerationActions detail={SUSPENDED_USER_DETAIL} onActionComplete={onActionComplete} />,
    );

    await user.click(screen.getByTestId("action-reactivate-account"));
    expect(screen.getByTestId("action-dialog")).toBeInTheDocument();

    await user.click(screen.getByTestId("action-confirm"));

    await waitFor(() => {
      expect(mockReactivateAccount).toHaveBeenCalledWith({
        userId: SUSPENDED_USER_DETAIL.targetId,
        reason: undefined,
      });
    });
    expect(onActionComplete).toHaveBeenCalled();
  });

  // ─── Dismiss flow ─────────────────────────────────────────────────

  it("dismisses report", async () => {
    mockDismissReport.mockResolvedValue({ success: true, actionId: "a4", message: "ok" });
    const user = userEvent.setup();

    render(<ModerationActions detail={BASE_DETAIL} onActionComplete={onActionComplete} />);

    await user.click(screen.getByTestId("action-dismiss"));
    await user.click(screen.getByTestId("action-confirm"));

    await waitFor(() => {
      expect(mockDismissReport).toHaveBeenCalledWith({
        reportId: BASE_DETAIL.ID,
        reason: undefined,
      });
    });
    expect(onActionComplete).toHaveBeenCalled();
  });

  // ─── Error handling ───────────────────────────────────────────────

  it("shows error on action failure", async () => {
    mockDismissReport.mockRejectedValue(new Error("Server error"));
    const user = userEvent.setup();

    render(<ModerationActions detail={BASE_DETAIL} onActionComplete={onActionComplete} />);

    await user.click(screen.getByTestId("action-dismiss"));
    await user.click(screen.getByTestId("action-confirm"));

    await waitFor(() => {
      expect(screen.getByTestId("action-error")).toBeInTheDocument();
    });
    expect(screen.getByText("Server error")).toBeInTheDocument();
    expect(onActionComplete).not.toHaveBeenCalled();
  });

  // ─── Cancel flow ──────────────────────────────────────────────────

  it("closes dialog on cancel", async () => {
    const user = userEvent.setup();

    render(<ModerationActions detail={BASE_DETAIL} onActionComplete={onActionComplete} />);

    await user.click(screen.getByTestId("action-dismiss"));
    expect(screen.getByTestId("action-dialog")).toBeInTheDocument();

    await user.click(screen.getByText("Annuler"));

    await waitFor(() => {
      expect(screen.queryByTestId("action-dialog")).not.toBeInTheDocument();
    });
  });

  // ─── Edge cases ───────────────────────────────────────────────────

  it("handles null targetData gracefully", () => {
    render(
      <ModerationActions
        detail={{ ...BASE_DETAIL, targetData: null }}
        onActionComplete={onActionComplete}
      />,
    );

    // Without targetData, listing is not detected as suspended so deactivate button shows
    expect(screen.getByTestId("action-deactivate-listing")).toBeInTheDocument();
    expect(screen.queryByTestId("action-reactivate-listing")).not.toBeInTheDocument();
  });

  it("handles malformed targetData gracefully", () => {
    render(
      <ModerationActions
        detail={{ ...BASE_DETAIL, targetData: "not-json" }}
        onActionComplete={onActionComplete}
      />,
    );

    expect(screen.getByTestId("action-deactivate-listing")).toBeInTheDocument();
  });
});
