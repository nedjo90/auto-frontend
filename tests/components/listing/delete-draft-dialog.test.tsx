import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteDraftDialog } from "@/components/listing/delete-draft-dialog";

const mockOnConfirm = vi.fn();
const mockOnCancel = vi.fn();

function renderDialog(open = true) {
  return render(
    <DeleteDraftDialog open={open} onConfirm={mockOnConfirm} onCancel={mockOnCancel} />,
  );
}

describe("DeleteDraftDialog", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render dialog when open", () => {
    renderDialog(true);
    expect(screen.getByTestId("delete-draft-dialog")).toBeInTheDocument();
  });

  it("should not render dialog when closed", () => {
    renderDialog(false);
    expect(screen.queryByTestId("delete-draft-dialog")).not.toBeInTheDocument();
  });

  it("should display confirmation title", () => {
    renderDialog();
    expect(screen.getByText("Supprimer le brouillon")).toBeInTheDocument();
  });

  it("should display warning description", () => {
    renderDialog();
    expect(screen.getByText(/irréversible/)).toBeInTheDocument();
  });

  it("should call onConfirm when Supprimer button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByTestId("delete-confirm-btn"));
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it("should call onCancel when Annuler button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByTestId("delete-cancel-btn"));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
