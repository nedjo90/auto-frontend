import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ConfigChangeConfirmDialog,
  type ConfigChange,
} from "@/components/admin/config-change-confirm-dialog";

const changes: ConfigChange[] = [{ field: "listing.price", oldValue: "15", newValue: "20" }];

describe("ConfigChangeConfirmDialog", () => {
  it("should render dialog with changes when open", () => {
    render(
      <ConfigChangeConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        changes={changes}
      />,
    );

    expect(screen.getByText("Confirmer les modifications")).toBeInTheDocument();
    expect(screen.getByText("listing.price")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("should display impact message when provided", () => {
    render(
      <ConfigChangeConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        changes={changes}
        impactMessage="Cette modification affectera les prochaines annonces."
      />,
    );

    expect(
      screen.getByText("Cette modification affectera les prochaines annonces."),
    ).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfigChangeConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        changes={changes}
      />,
    );

    await user.click(screen.getByText("Confirmer"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ConfigChangeConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        changes={changes}
      />,
    );

    await user.click(screen.getByText("Annuler"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should disable buttons when loading", () => {
    render(
      <ConfigChangeConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        changes={changes}
        loading={true}
      />,
    );

    expect(screen.getByText("Annuler").closest("button")).toBeDisabled();
    expect(screen.getByText("Confirmer").closest("button")).toBeDisabled();
  });

  it("should show (vide) for empty old/new values", () => {
    render(
      <ConfigChangeConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        changes={[{ field: "test", oldValue: "", newValue: "new" }]}
      />,
    );

    expect(screen.getByText("(vide)")).toBeInTheDocument();
  });

  it("should allow custom title", () => {
    render(
      <ConfigChangeConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        changes={changes}
        title="Titre personnalise"
      />,
    );

    expect(screen.getByText("Titre personnalise")).toBeInTheDocument();
  });
});
