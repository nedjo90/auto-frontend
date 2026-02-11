import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertFormDialog } from "@/components/admin/alert-form-dialog";
import type { IConfigAlert } from "@auto/shared";

const MANAGED = {
  createdAt: "2026-02-11T00:00:00Z",
  createdBy: "admin",
  modifiedAt: "2026-02-11T00:00:00Z",
  modifiedBy: "admin",
};

const mockAlert: IConfigAlert = {
  ID: "a1",
  name: "Test Alert",
  metric: "margin_per_listing",
  thresholdValue: 8,
  comparisonOperator: "below",
  notificationMethod: "both",
  severityLevel: "critical",
  enabled: true,
  cooldownMinutes: 30,
  lastTriggeredAt: null,
  ...MANAGED,
};

describe("AlertFormDialog", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("should render create mode title when no initial data", () => {
    render(<AlertFormDialog open={true} onClose={vi.fn()} onSubmit={vi.fn()} initialData={null} />);
    expect(screen.getByText("Nouvelle alerte")).toBeInTheDocument();
  });

  it("should render edit mode title when initial data provided", () => {
    render(
      <AlertFormDialog open={true} onClose={vi.fn()} onSubmit={vi.fn()} initialData={mockAlert} />,
    );
    expect(screen.getByText("Modifier l'alerte")).toBeInTheDocument();
  });

  it("should populate fields with initial data in edit mode", () => {
    render(
      <AlertFormDialog open={true} onClose={vi.fn()} onSubmit={vi.fn()} initialData={mockAlert} />,
    );
    const nameInput = screen.getByTestId("alert-name-input") as HTMLInputElement;
    expect(nameInput.value).toBe("Test Alert");
    const thresholdInput = screen.getByTestId("alert-threshold-input") as HTMLInputElement;
    expect(thresholdInput.value).toBe("8");
    const cooldownInput = screen.getByTestId("alert-cooldown-input") as HTMLInputElement;
    expect(cooldownInput.value).toBe("30");
  });

  it("should call onSubmit with form data when submitted", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <AlertFormDialog open={true} onClose={vi.fn()} onSubmit={onSubmit} initialData={null} />,
    );

    const nameInput = screen.getByTestId("alert-name-input");
    await user.type(nameInput, "My Alert");

    await user.click(screen.getByText("Creer"));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "My Alert",
        enabled: true,
      }),
    );
  });

  it("should call onClose when cancel clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<AlertFormDialog open={true} onClose={onClose} onSubmit={vi.fn()} initialData={null} />);
    await user.click(screen.getByText("Annuler"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should disable submit when name is empty", () => {
    render(<AlertFormDialog open={true} onClose={vi.fn()} onSubmit={vi.fn()} initialData={null} />);
    const submitBtn = screen.getByText("Creer").closest("button");
    expect(submitBtn).toBeDisabled();
  });

  it("should disable buttons when loading", () => {
    render(
      <AlertFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        initialData={mockAlert}
        loading={true}
      />,
    );
    expect(screen.getByText("Annuler").closest("button")).toBeDisabled();
  });

  it("should show Enregistrer button in edit mode", () => {
    render(
      <AlertFormDialog open={true} onClose={vi.fn()} onSubmit={vi.fn()} initialData={mockAlert} />,
    );
    expect(screen.getByText("Enregistrer")).toBeInTheDocument();
  });

  it("should render all form fields", () => {
    render(<AlertFormDialog open={true} onClose={vi.fn()} onSubmit={vi.fn()} initialData={null} />);
    expect(screen.getByTestId("alert-name-input")).toBeInTheDocument();
    expect(screen.getByTestId("alert-metric-select")).toBeInTheDocument();
    expect(screen.getByTestId("alert-operator-select")).toBeInTheDocument();
    expect(screen.getByTestId("alert-threshold-input")).toBeInTheDocument();
    expect(screen.getByTestId("alert-notification-select")).toBeInTheDocument();
    expect(screen.getByTestId("alert-severity-select")).toBeInTheDocument();
    expect(screen.getByTestId("alert-cooldown-input")).toBeInTheDocument();
  });
});
