import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DraftCard, type DraftCardData } from "@/components/listing/draft-card";

const mockDraft: DraftCardData = {
  ID: "draft-123",
  make: "Renault",
  model: "Clio",
  createdAt: "2026-02-20T10:00:00Z",
  completionPercentage: 65,
  visibilityScore: 72,
  photoCount: 3,
};

const mockOnEdit = vi.fn();
const mockOnDuplicate = vi.fn();
const mockOnDelete = vi.fn();

function renderCard(draft: DraftCardData = mockDraft) {
  return render(
    <DraftCard
      draft={draft}
      onEdit={mockOnEdit}
      onDuplicate={mockOnDuplicate}
      onDelete={mockOnDelete}
    />,
  );
}

describe("DraftCard", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render the card with draft ID", () => {
    renderCard();
    expect(screen.getByTestId("draft-card-draft-123")).toBeInTheDocument();
  });

  it("should display vehicle make and model as title", () => {
    renderCard();
    expect(screen.getByTestId("draft-card-title")).toHaveTextContent("Renault Clio");
  });

  it("should show 'Nouveau véhicule' when make/model not set", () => {
    renderCard({ ...mockDraft, make: null, model: null });
    expect(screen.getByTestId("draft-card-title")).toHaveTextContent("Nouveau véhicule");
  });

  it("should display formatted creation date", () => {
    renderCard();
    expect(screen.getByTestId("draft-card-date")).toBeInTheDocument();
  });

  it("should display completion percentage", () => {
    renderCard();
    expect(screen.getByTestId("draft-card-completion")).toHaveTextContent("65%");
  });

  it("should display progress bar with correct aria attributes", () => {
    renderCard();
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "65");
  });

  it("should display visibility score badge", () => {
    renderCard();
    expect(screen.getByTestId("draft-card-score")).toHaveTextContent("Score : 72%");
  });

  it("should display photo count", () => {
    renderCard();
    expect(screen.getByTestId("draft-card-photos")).toHaveTextContent("3");
  });

  it("should call onEdit when Modifier is clicked", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTestId("draft-edit-btn"));
    expect(mockOnEdit).toHaveBeenCalledWith("draft-123");
  });

  it("should call onDuplicate when Dupliquer is clicked", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTestId("draft-duplicate-btn"));
    expect(mockOnDuplicate).toHaveBeenCalledWith("draft-123");
  });

  it("should call onDelete when Supprimer is clicked", async () => {
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByTestId("draft-delete-btn"));
    expect(mockOnDelete).toHaveBeenCalledWith("draft-123");
  });

  describe("score badge variants", () => {
    it("should use green for score >= 80", () => {
      renderCard({ ...mockDraft, visibilityScore: 85 });
      expect(screen.getByTestId("draft-card-score")).toHaveTextContent("Score : 85%");
    });

    it("should use yellow for score 50-79", () => {
      renderCard({ ...mockDraft, visibilityScore: 60 });
      expect(screen.getByTestId("draft-card-score")).toHaveTextContent("Score : 60%");
    });

    it("should use outline for score < 50", () => {
      renderCard({ ...mockDraft, visibilityScore: 30 });
      expect(screen.getByTestId("draft-card-score")).toHaveTextContent("Score : 30%");
    });
  });
});
