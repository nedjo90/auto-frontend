import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DraftSaveFooter } from "@/components/listing/draft-save-footer";
import { useListingStore } from "@/stores/listing-store";

// Mock useDraftSave hook
const mockHandleManualSave = vi.fn();
vi.mock("@/hooks/use-draft-save", () => ({
  useDraftSave: () => ({
    handleManualSave: mockHandleManualSave,
    isSaving: useListingStore.getState().isSaving,
    isDirty: useListingStore.getState().isDirty,
  }),
}));

describe("DraftSaveFooter", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    useListingStore.setState({
      listingId: "listing-123",
      fields: {},
      visibilityScore: 50,
      visibilityLabel: "Partiellement documenté",
      completionPercentage: 25,
      isLoading: false,
      isDirty: true,
      lastSavedAt: null,
      isSaving: false,
    });
  });

  it("should render the footer", () => {
    render(<DraftSaveFooter />);
    expect(screen.getByTestId("draft-save-footer")).toBeInTheDocument();
  });

  it("should render save draft button", () => {
    render(<DraftSaveFooter />);
    expect(screen.getByTestId("save-draft-btn")).toBeInTheDocument();
    expect(screen.getByText("Sauvegarder le brouillon")).toBeInTheDocument();
  });

  it("should enable button when dirty and not saving", () => {
    render(<DraftSaveFooter />);
    expect(screen.getByTestId("save-draft-btn")).not.toBeDisabled();
  });

  it("should disable button when not dirty", () => {
    useListingStore.setState({ isDirty: false });
    render(<DraftSaveFooter />);
    expect(screen.getByTestId("save-draft-btn")).toBeDisabled();
  });

  it("should disable button when saving", () => {
    useListingStore.setState({ isSaving: true });
    render(<DraftSaveFooter />);
    expect(screen.getByTestId("save-draft-btn")).toBeDisabled();
  });

  it("should call handleManualSave when button is clicked", async () => {
    const user = userEvent.setup();
    render(<DraftSaveFooter />);
    await user.click(screen.getByTestId("save-draft-btn"));
    expect(mockHandleManualSave).toHaveBeenCalled();
  });

  it("should show auto-save indicator when saving", () => {
    useListingStore.setState({ isSaving: true });
    render(<DraftSaveFooter />);
    expect(screen.getByTestId("auto-save-indicator")).toBeInTheDocument();
    expect(screen.getByText("Sauvegarde automatique...")).toBeInTheDocument();
  });

  it("should show last saved time when available", () => {
    const date = new Date(2026, 1, 23, 14, 30);
    useListingStore.setState({ lastSavedAt: date, isSaving: false });
    render(<DraftSaveFooter />);
    expect(screen.getByTestId("last-saved-at")).toBeInTheDocument();
    expect(screen.getByTestId("last-saved-at").textContent).toContain("14:30");
  });

  it("should not show last saved time when null", () => {
    useListingStore.setState({ lastSavedAt: null, isSaving: false });
    render(<DraftSaveFooter />);
    expect(screen.queryByTestId("last-saved-at")).not.toBeInTheDocument();
  });

  it("should show completion percentage when > 0", () => {
    useListingStore.setState({ completionPercentage: 42 });
    render(<DraftSaveFooter />);
    expect(screen.getByTestId("completion-pct")).toBeInTheDocument();
    expect(screen.getByText("42% complété")).toBeInTheDocument();
  });

  it("should not show completion percentage when 0", () => {
    useListingStore.setState({ completionPercentage: 0 });
    render(<DraftSaveFooter />);
    expect(screen.queryByTestId("completion-pct")).not.toBeInTheDocument();
  });

  it("should show saving text in button when saving", () => {
    useListingStore.setState({ isSaving: true, isDirty: true });
    render(<DraftSaveFooter />);
    expect(screen.getByText("Sauvegarde...")).toBeInTheDocument();
  });
});
