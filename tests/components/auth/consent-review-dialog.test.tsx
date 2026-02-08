import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConsentReviewDialog } from "@/components/auth/consent-review-dialog";
import { useConsentStore } from "@/stores/consent-store";
import type { IConfigConsentType } from "@auto/shared";

vi.mock("@/lib/auth/get-auth-headers", () => ({
  getAuthHeaders: vi.fn().mockResolvedValue({}),
}));

const mockConsentTypes: IConfigConsentType[] = [
  {
    ID: "ct-1",
    code: "essential_processing",
    labelKey: "Traitement essentiel des données",
    descriptionKey: "Nécessaire au fonctionnement du service",
    isMandatory: true,
    isActive: true,
    displayOrder: 10,
    version: 2,
    createdAt: "",
    modifiedAt: "",
    createdBy: "",
    modifiedBy: "",
  },
  {
    ID: "ct-2",
    code: "marketing_email",
    labelKey: "Communications marketing",
    descriptionKey: "Recevoir des offres par email",
    isMandatory: false,
    isActive: true,
    displayOrder: 20,
    version: 2,
    createdAt: "",
    modifiedAt: "",
    createdBy: "",
    modifiedBy: "",
  },
];

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
  useConsentStore.setState({
    pendingConsents: [],
    hasPendingConsents: false,
  });
});

afterEach(() => {
  cleanup();
});

describe("ConsentReviewDialog", () => {
  it("should not render when no pending consents", () => {
    render(<ConsentReviewDialog />);
    expect(screen.queryByText("Mise à jour des consentements")).not.toBeInTheDocument();
  });

  it("should render dialog when pending consents exist", () => {
    useConsentStore.setState({
      pendingConsents: mockConsentTypes,
      hasPendingConsents: true,
    });

    render(<ConsentReviewDialog />);
    expect(screen.getByText("Mise à jour des consentements")).toBeInTheDocument();
  });

  it("should display consent types in the dialog", () => {
    useConsentStore.setState({
      pendingConsents: mockConsentTypes,
      hasPendingConsents: true,
    });

    render(<ConsentReviewDialog />);
    expect(screen.getByLabelText(/Traitement essentiel/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Communications marketing/)).toBeInTheDocument();
  });

  it("should not have a close button (blocking dialog)", () => {
    useConsentStore.setState({
      pendingConsents: mockConsentTypes,
      hasPendingConsents: true,
    });

    render(<ConsentReviewDialog />);
    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("should show error when mandatory consent not checked on submit", async () => {
    useConsentStore.setState({
      pendingConsents: mockConsentTypes,
      hasPendingConsents: true,
    });
    const user = userEvent.setup();

    render(<ConsentReviewDialog />);
    await user.click(screen.getByText("Confirmer mes choix"));

    await waitFor(() => {
      expect(screen.getByText("Ce consentement est requis")).toBeInTheDocument();
    });
  });

  it("should submit and close dialog on valid consent", async () => {
    useConsentStore.setState({
      pendingConsents: mockConsentTypes,
      hasPendingConsents: true,
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, count: 2 }),
    });

    const user = userEvent.setup();
    render(<ConsentReviewDialog />);

    // Check mandatory consent
    await user.click(screen.getByLabelText(/Traitement essentiel/));
    await user.click(screen.getByText("Confirmer mes choix"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/consent/recordConsents"),
        expect.objectContaining({ method: "POST" }),
      );
    });

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText("Mise à jour des consentements")).not.toBeInTheDocument();
    });
  });

  it("should show error on API failure", async () => {
    useConsentStore.setState({
      pendingConsents: mockConsentTypes,
      hasPendingConsents: true,
    });

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const user = userEvent.setup();
    render(<ConsentReviewDialog />);

    await user.click(screen.getByLabelText(/Traitement essentiel/));
    await user.click(screen.getByText("Confirmer mes choix"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
