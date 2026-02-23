import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OverrideConfirmDialog } from "@/components/listing/override-confirm-dialog";

const mockOnConfirm = vi.fn();
const mockOnCancel = vi.fn();

function renderDialog(open = true) {
  return render(
    <OverrideConfirmDialog
      open={open}
      fieldName="make"
      fieldLabel="Marque"
      certifiedValue="Renault"
      onConfirm={mockOnConfirm}
      onCancel={mockOnCancel}
    />,
  );
}

describe("OverrideConfirmDialog", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("when open", () => {
    it("should render dialog content", () => {
      renderDialog(true);
      expect(screen.getByTestId("override-confirm-dialog")).toBeInTheDocument();
    });

    it("should show warning message", () => {
      renderDialog(true);
      expect(
        screen.getByText("La valeur certifiée sera remplacée par votre saisie."),
      ).toBeInTheDocument();
    });

    it("should display the field label", () => {
      renderDialog(true);
      expect(screen.getByText("Marque")).toBeInTheDocument();
    });

    it("should display the certified value", () => {
      renderDialog(true);
      expect(screen.getByTestId("certified-value-display")).toHaveTextContent("Renault");
    });

    it("should show historical preservation note", () => {
      renderDialog(true);
      expect(screen.getByText(/La valeur certifiée originale sera conservée/)).toBeInTheDocument();
    });

    it("should show Modifier and Annuler buttons", () => {
      renderDialog(true);
      expect(screen.getByTestId("override-confirm-btn")).toBeInTheDocument();
      expect(screen.getByTestId("override-cancel-btn")).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onConfirm when Modifier button clicked", async () => {
      const user = userEvent.setup();
      renderDialog(true);
      await user.click(screen.getByTestId("override-confirm-btn"));
      expect(mockOnConfirm).toHaveBeenCalledOnce();
    });

    it("should call onCancel when Annuler button clicked", async () => {
      const user = userEvent.setup();
      renderDialog(true);
      await user.click(screen.getByTestId("override-cancel-btn"));
      expect(mockOnCancel).toHaveBeenCalledOnce();
    });
  });

  describe("when closed", () => {
    it("should not render dialog content", () => {
      renderDialog(false);
      expect(screen.queryByTestId("override-confirm-dialog")).not.toBeInTheDocument();
    });
  });
});
