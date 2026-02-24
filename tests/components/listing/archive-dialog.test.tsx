import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArchiveDialog } from "@/components/listing/archive-dialog";

const mockOnConfirm = vi.fn().mockResolvedValue(undefined);
const mockOnOpenChange = vi.fn();

function renderDialog(open = true) {
  return render(
    <ArchiveDialog
      open={open}
      onOpenChange={mockOnOpenChange}
      listingTitle="Peugeot 308 (2023)"
      onConfirm={mockOnConfirm}
    />,
  );
}

describe("ArchiveDialog", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render dialog title when open", () => {
    renderDialog(true);
    expect(screen.getByText(/ne sera plus visible publiquement/i)).toBeInTheDocument();
  });

  it("should display listing title in description", () => {
    renderDialog();
    expect(screen.getByText(/Peugeot 308 \(2023\)/)).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: /retirer l'annonce/i }));
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("should call onOpenChange when cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: /annuler/i }));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("should mention irreversibility in description", () => {
    renderDialog();
    expect(screen.getByText(/irreversible/i)).toBeInTheDocument();
  });
});
