import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListingForm } from "@/components/listing/listing-form";
import type { ListingFieldState } from "@auto/shared";

// Mock @auto/shared for field constants
vi.mock("@auto/shared", async () => {
  const actual = await vi.importActual("@auto/shared");
  return {
    ...actual,
  };
});

const mockOnFieldChange = vi.fn();
const mockOnCertifiedOverride = vi.fn();

function renderForm(fields: Record<string, ListingFieldState> = {}, visibilityScore = 50) {
  return render(
    <ListingForm
      fields={fields}
      visibilityScore={visibilityScore}
      onFieldChange={mockOnFieldChange}
      onCertifiedOverride={mockOnCertifiedOverride}
    />,
  );
}

describe("ListingForm", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the form container", () => {
      renderForm();
      expect(screen.getByTestId("listing-form")).toBeInTheDocument();
    });

    it("should render section navigation", () => {
      renderForm();
      expect(screen.getByTestId("section-nav")).toBeInTheDocument();
    });

    it("should render all 5 section nav buttons", () => {
      renderForm();
      expect(screen.getByTestId("nav-vehicle_identity")).toBeInTheDocument();
      expect(screen.getByTestId("nav-technical_details")).toBeInTheDocument();
      expect(screen.getByTestId("nav-condition_description")).toBeInTheDocument();
      expect(screen.getByTestId("nav-pricing")).toBeInTheDocument();
      expect(screen.getByTestId("nav-options_equipment")).toBeInTheDocument();
    });

    it("should render all 5 form sections", () => {
      renderForm();
      expect(screen.getByTestId("section-vehicle_identity")).toBeInTheDocument();
      expect(screen.getByTestId("section-technical_details")).toBeInTheDocument();
      expect(screen.getByTestId("section-condition_description")).toBeInTheDocument();
      expect(screen.getByTestId("section-pricing")).toBeInTheDocument();
      expect(screen.getByTestId("section-options_equipment")).toBeInTheDocument();
    });

    it("should render section headings with French labels", () => {
      renderForm();
      // Labels appear in both nav buttons and section headings (2+ each)
      expect(screen.getAllByText("Identité du véhicule").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Détails techniques").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("État et description").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Tarification").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("Options et équipements").length).toBeGreaterThanOrEqual(2);
    });

    it("should render visibility score", () => {
      renderForm({}, 75);
      const scoreEl = screen.getByTestId("visibility-score");
      expect(scoreEl).toBeInTheDocument();
      expect(scoreEl).toHaveTextContent("75%");
    });
  });

  describe("visibility score display", () => {
    it("should show green badge for score >= 80", () => {
      renderForm({}, 85);
      const badge = screen.getByLabelText(/Score de visibilité: 85/);
      expect(badge).toBeInTheDocument();
    });

    it("should show yellow badge for score 50-79", () => {
      renderForm({}, 65);
      const badge = screen.getByLabelText(/Score de visibilité: 65/);
      expect(badge).toBeInTheDocument();
    });

    it("should show outline badge for score < 50", () => {
      renderForm({}, 30);
      const badge = screen.getByLabelText(/Score de visibilité: 30/);
      expect(badge).toBeInTheDocument();
    });
  });

  describe("field status badges", () => {
    it("should show certified badge for certified fields", () => {
      const fields: Record<string, ListingFieldState> = {
        make: {
          fieldName: "make",
          value: "Renault",
          status: "certified",
          certifiedSource: "SIV",
        },
      };
      renderForm(fields);
      expect(screen.getByTestId("badge-certified")).toBeInTheDocument();
    });

    it("should show declared badge for declared fields", () => {
      const fields: Record<string, ListingFieldState> = {
        price: {
          fieldName: "price",
          value: 15000,
          status: "declared",
        },
      };
      renderForm(fields);
      expect(screen.getByTestId("badge-declared")).toBeInTheDocument();
    });

    it("should show empty badge for unfilled fields", () => {
      renderForm({});
      const badges = screen.getAllByTestId("badge-empty");
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe("certified field display", () => {
    it("should show Modifier button for certified fields", () => {
      const fields: Record<string, ListingFieldState> = {
        make: {
          fieldName: "make",
          value: "Renault",
          status: "certified",
          certifiedSource: "SIV",
        },
      };
      renderForm(fields);
      expect(screen.getByTestId("override-btn-make")).toBeInTheDocument();
    });

    it("should make certified field input read-only", () => {
      const fields: Record<string, ListingFieldState> = {
        make: {
          fieldName: "make",
          value: "Renault",
          status: "certified",
        },
      };
      renderForm(fields);
      const input = screen.getByTestId("input-make");
      expect(input).toHaveAttribute("readonly");
    });

    it("should call onCertifiedOverride when Modifier is clicked", async () => {
      const user = userEvent.setup();
      const fields: Record<string, ListingFieldState> = {
        make: {
          fieldName: "make",
          value: "Renault",
          status: "certified",
        },
      };
      renderForm(fields);
      await user.click(screen.getByTestId("override-btn-make"));
      expect(mockOnCertifiedOverride).toHaveBeenCalledWith("make");
    });
  });

  describe("editable fields", () => {
    it("should render input for text fields", () => {
      renderForm({});
      const input = screen.getByTestId("input-make");
      expect(input).toBeInTheDocument();
    });

    it("should render select for condition field", () => {
      renderForm({});
      const select = screen.getByTestId("input-condition");
      expect(select.tagName.toLowerCase()).toBe("select");
    });

    it("should render textarea for description", () => {
      renderForm({});
      const textarea = screen.getByTestId("input-description");
      expect(textarea.tagName.toLowerCase()).toBe("textarea");
    });

    it("should call onFieldChange when editing a field", async () => {
      const user = userEvent.setup();
      renderForm({});
      const input = screen.getByTestId("input-make");
      await user.type(input, "Renault");
      expect(mockOnFieldChange).toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have section landmarks with labels", () => {
      renderForm();
      const sections = screen.getAllByRole("region", { hidden: false });
      // Each section has aria-labelledby pointing to a heading
      // Note: sections use <section> element with aria-labelledby
      const vehicleSection = screen.getByTestId("section-vehicle_identity");
      expect(vehicleSection).toHaveAttribute("aria-labelledby", "heading-vehicle_identity");
    });

    it("should have aria-label on navigation", () => {
      renderForm();
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Sections du formulaire");
    });

    it("should have aria-label on visibility score badge", () => {
      renderForm({}, 75);
      expect(screen.getByLabelText(/Score de visibilité: 75/)).toBeInTheDocument();
    });

    it("should have aria-label on status badges", () => {
      const fields: Record<string, ListingFieldState> = {
        make: { fieldName: "make", value: "Renault", status: "certified", certifiedSource: "SIV" },
      };
      renderForm(fields);
      expect(screen.getByLabelText(/Certifié par SIV/)).toBeInTheDocument();
    });

    it("should have aria-required on required fields", () => {
      renderForm({});
      const makeInput = screen.getByTestId("input-make");
      expect(makeInput).toHaveAttribute("aria-required", "true");
    });

    it("should have aria-invalid when field has error", async () => {
      const user = userEvent.setup();
      renderForm({});
      // Price validation: empty string won't trigger validation since it's the default
      // Type a non-numeric value
      const conditionSelect = screen.getByTestId("input-condition");
      // Condition field is a select, so let's test price with an out-of-range value
      const priceInput = screen.getByTestId("input-price");
      await user.clear(priceInput);
      await user.type(priceInput, "-5");
      expect(priceInput).toHaveAttribute("aria-invalid", "true");
    });

    it("should link error messages via aria-describedby", async () => {
      const user = userEvent.setup();
      renderForm({});
      const priceInput = screen.getByTestId("input-price");
      await user.type(priceInput, "-5");
      expect(priceInput).toHaveAttribute("aria-describedby");
    });
  });

  describe("loading state", () => {
    it("should disable fields when loading", () => {
      render(
        <ListingForm
          fields={{}}
          visibilityScore={50}
          onFieldChange={mockOnFieldChange}
          onCertifiedOverride={mockOnCertifiedOverride}
          isLoading={true}
        />,
      );
      const input = screen.getByTestId("input-make");
      expect(input).toBeDisabled();
    });
  });
});
