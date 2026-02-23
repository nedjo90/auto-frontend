import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListingFormField } from "@/components/listing/listing-form-field";
import type { ListingFieldMeta, ListingFieldState } from "@auto/shared";

const mockOnFieldChange = vi.fn();
const mockOnCertifiedOverride = vi.fn();

const makeMeta: ListingFieldMeta = {
  fieldName: "make",
  fieldType: "certifiable",
  category: "vehicle_identity",
  labelFr: "Marque",
  required: true,
};

const priceMeta: ListingFieldMeta = {
  fieldName: "price",
  fieldType: "declaredOnly",
  category: "pricing",
  labelFr: "Prix (€)",
  required: true,
};

const conditionMeta: ListingFieldMeta = {
  fieldName: "condition",
  fieldType: "declaredOnly",
  category: "condition_description",
  labelFr: "État général",
  required: true,
};

const descriptionMeta: ListingFieldMeta = {
  fieldName: "description",
  fieldType: "declaredOnly",
  category: "condition_description",
  labelFr: "Description",
  required: true,
};

describe("ListingFormField", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("empty state", () => {
    it("should render with À compléter badge when no field state", () => {
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.getByTestId("badge-empty")).toBeInTheDocument();
      expect(screen.getByText("À compléter")).toBeInTheDocument();
    });

    it("should render editable input", () => {
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      const input = screen.getByTestId("input-make");
      expect(input).not.toHaveAttribute("readonly");
      expect(input).not.toBeDisabled();
    });
  });

  describe("certified state", () => {
    const certifiedState: ListingFieldState = {
      fieldName: "make",
      value: "Renault",
      status: "certified",
      certifiedSource: "SIV",
    };

    it("should render with Certifié badge", () => {
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          fieldState={certifiedState}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.getByTestId("badge-certified")).toBeInTheDocument();
      expect(screen.getByText("Certifié")).toBeInTheDocument();
    });

    it("should render read-only input with green styling", () => {
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          fieldState={certifiedState}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      const input = screen.getByTestId("input-make");
      expect(input).toHaveAttribute("readonly");
      expect(input).toHaveAttribute("aria-readonly", "true");
      expect(input).not.toBeDisabled();
    });

    it("should render Modifier button", () => {
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          fieldState={certifiedState}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.getByTestId("override-btn-make")).toBeInTheDocument();
      expect(screen.getByText("Modifier")).toBeInTheDocument();
    });

    it("should call onCertifiedOverride when Modifier clicked", async () => {
      const user = userEvent.setup();
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          fieldState={certifiedState}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      await user.click(screen.getByTestId("override-btn-make"));
      expect(mockOnCertifiedOverride).toHaveBeenCalledWith("make");
    });

    it("should have aria-label with source on badge", () => {
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          fieldState={certifiedState}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.getByLabelText(/Certifié par SIV/)).toBeInTheDocument();
    });
  });

  describe("declared state", () => {
    const declaredState: ListingFieldState = {
      fieldName: "price",
      value: 15000,
      status: "declared",
    };

    it("should render with Déclaré vendeur badge", () => {
      render(
        <ListingFormField
          fieldMeta={priceMeta}
          fieldState={declaredState}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.getByTestId("badge-declared")).toBeInTheDocument();
    });

    it("should have aria-label on declared badge", () => {
      render(
        <ListingFormField
          fieldMeta={priceMeta}
          fieldState={declaredState}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.getByLabelText("Déclaré par le vendeur")).toBeInTheDocument();
    });
  });

  describe("original certified value display", () => {
    it("should show original certified value when field was overridden", () => {
      const overriddenState: ListingFieldState = {
        fieldName: "make",
        value: "Peugeot",
        status: "declared",
        originalCertifiedValue: "Renault",
      };
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          fieldState={overriddenState}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.getByTestId("original-value-make")).toBeInTheDocument();
      expect(screen.getByText("Valeur certifiée: Renault")).toBeInTheDocument();
    });
  });

  describe("special field types", () => {
    it("should render select for condition field", () => {
      render(
        <ListingFormField
          fieldMeta={conditionMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      const select = screen.getByTestId("input-condition");
      expect(select.tagName.toLowerCase()).toBe("select");
    });

    it("should render condition options", () => {
      render(
        <ListingFormField
          fieldMeta={conditionMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.getByText("Excellent")).toBeInTheDocument();
      expect(screen.getByText("Bon")).toBeInTheDocument();
      expect(screen.getByText("Correct")).toBeInTheDocument();
      expect(screen.getByText("À restaurer")).toBeInTheDocument();
    });

    it("should render textarea for description", () => {
      render(
        <ListingFormField
          fieldMeta={descriptionMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      const textarea = screen.getByTestId("input-description");
      expect(textarea.tagName.toLowerCase()).toBe("textarea");
    });

    it("should use number type for price input", () => {
      render(
        <ListingFormField
          fieldMeta={priceMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      const input = screen.getByTestId("input-price");
      expect(input).toHaveAttribute("type", "number");
    });
  });

  describe("validation", () => {
    it("should show error for invalid price", async () => {
      const user = userEvent.setup();
      render(
        <ListingFormField
          fieldMeta={priceMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      const input = screen.getByTestId("input-price");
      await user.type(input, "-5");
      expect(screen.getByTestId("error-price")).toBeInTheDocument();
    });

    it("should mark input as aria-invalid on error", async () => {
      const user = userEvent.setup();
      render(
        <ListingFormField
          fieldMeta={priceMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      const input = screen.getByTestId("input-price");
      await user.type(input, "-5");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should show error role=alert", async () => {
      const user = userEvent.setup();
      render(
        <ListingFormField
          fieldMeta={priceMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      const input = screen.getByTestId("input-price");
      await user.type(input, "-5");
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("required indicator", () => {
    it("should show asterisk for required fields", () => {
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("should not show asterisk for optional fields", () => {
      const optionalMeta: ListingFieldMeta = {
        ...makeMeta,
        required: false,
      };
      render(
        <ListingFormField
          fieldMeta={optionalMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
        />,
      );
      expect(screen.queryByText("*")).not.toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("should disable input when disabled prop is true", () => {
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
          disabled={true}
        />,
      );
      expect(screen.getByTestId("input-make")).toBeDisabled();
    });

    it("should disable override button when disabled", () => {
      const certifiedState: ListingFieldState = {
        fieldName: "make",
        value: "Renault",
        status: "certified",
      };
      render(
        <ListingFormField
          fieldMeta={makeMeta}
          fieldState={certifiedState}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
          disabled={true}
        />,
      );
      expect(screen.getByTestId("override-btn-make")).toBeDisabled();
    });
  });
});
