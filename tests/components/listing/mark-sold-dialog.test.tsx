import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkSoldDialog } from "@/components/listing/mark-sold-dialog";

const mockOnConfirm = vi.fn().mockResolvedValue(undefined);
const mockOnOpenChange = vi.fn();

function renderDialog(open = true) {
  return render(
    <MarkSoldDialog
      open={open}
      onOpenChange={mockOnOpenChange}
      listingTitle="Renault Clio (2022)"
      onConfirm={mockOnConfirm}
    />,
  );
}

describe("MarkSoldDialog", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render dialog title when open", () => {
    renderDialog(true);
    expect(screen.getByText("Marquer comme vendu")).toBeInTheDocument();
  });

  it("should display listing title in description", () => {
    renderDialog();
    expect(screen.getByText(/Renault Clio \(2022\)/)).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: /confirmer la vente/i }));
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("should call onOpenChange when cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: /annuler/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should mention search visibility in description", () => {
    renderDialog();
    expect(screen.getByText(/resultats de recherche/)).toBeInTheDocument();
  });
});
