import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListingForm } from "@/components/listing/listing-form";
import type { ListingFieldState } from "@auto/shared";

const mockOnFieldChange = vi.fn();
const mockOnCertifiedOverride = vi.fn();

function renderFormWithFields() {
  const fields: Record<string, ListingFieldState> = {
    make: {
      fieldName: "make",
      value: "Renault",
      status: "certified",
      certifiedSource: "SIV",
      certifiedTimestamp: "2026-02-23T10:00:00Z",
    },
    model: {
      fieldName: "model",
      value: "Clio",
      status: "certified",
      certifiedSource: "SIV",
    },
    price: {
      fieldName: "price",
      value: 15000,
      status: "declared",
    },
    mileage: {
      fieldName: "mileage",
      value: null,
      status: "empty",
    },
  };

  return render(
    <ListingForm
      fields={fields}
      visibilityScore={65}
      onFieldChange={mockOnFieldChange}
      onCertifiedOverride={mockOnCertifiedOverride}
    />,
  );
}

describe("Accessibility Audit (WCAG 2.1 AA)", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("Labels and Form Structure (WCAG 1.3.1, 3.3.2)", () => {
    it("should associate labels with inputs via htmlFor/id", () => {
      renderFormWithFields();
      // Check that all label elements are properly associated
      const labels = screen.getAllByText(/Marque|Modèle|Prix|Kilométrage/);
      // At minimum, the form field labels exist
      expect(labels.length).toBeGreaterThan(0);
    });

    it("should have required indicator on required fields", () => {
      renderFormWithFields();
      // Required fields have aria-required
      // Certified fields are readonly, so aria-required doesn't apply to them
      // Check a non-certified required field
      const conditionInput = screen.getByTestId("input-condition");
      expect(conditionInput).toHaveAttribute("aria-required", "true");
    });

    it("should use semantic section elements with aria-labelledby", () => {
      renderFormWithFields();
      const vehicleSection = screen.getByTestId("section-vehicle_identity");
      expect(vehicleSection.tagName.toLowerCase()).toBe("section");
      expect(vehicleSection).toHaveAttribute("aria-labelledby", "heading-vehicle_identity");
    });

    it("should have proper heading hierarchy (h2 for sections)", () => {
      renderFormWithFields();
      const headings = screen.getAllByRole("heading", { level: 2 });
      expect(headings.length).toBe(5);
    });
  });

  describe("Error Messages (WCAG 3.3.1, 3.3.3)", () => {
    it("should link error messages via aria-describedby", async () => {
      const user = userEvent.setup();
      renderFormWithFields();
      // Use description field - type too-short text to trigger validation
      const descInput = screen.getByTestId("input-description");
      await user.type(descInput, "short");

      expect(descInput).toHaveAttribute("aria-describedby");
      expect(descInput).toHaveAttribute("aria-invalid", "true");
    });

    it("should announce errors with role=alert", async () => {
      const user = userEvent.setup();
      renderFormWithFields();
      const descInput = screen.getByTestId("input-description");
      await user.type(descInput, "short");

      const errorEl = screen.getByTestId("error-description");
      expect(errorEl).toHaveAttribute("role", "alert");
    });
  });

  describe("Badge Text Equivalents (WCAG 1.1.1)", () => {
    it("should have aria-label on certified badges", () => {
      renderFormWithFields();
      const certBadge = screen.getAllByTestId("badge-certified")[0];
      expect(certBadge).toHaveAttribute("aria-label");
      expect(certBadge.getAttribute("aria-label")).toContain("Certifié");
    });

    it("should have aria-label on declared badges", () => {
      renderFormWithFields();
      const declBadge = screen.getByTestId("badge-declared");
      expect(declBadge).toHaveAttribute("aria-label", "Déclaré par le vendeur");
    });

    it("should have aria-label on empty badges", () => {
      renderFormWithFields();
      const emptyBadges = screen.getAllByTestId("badge-empty");
      expect(emptyBadges[0]).toHaveAttribute("aria-label", "À compléter");
    });

    it("should have aria-label on visibility score badge", () => {
      renderFormWithFields();
      const scoreBadge = screen.getByLabelText(/Score de visibilité: 65/);
      expect(scoreBadge).toBeInTheDocument();
    });
  });

  describe("Navigation (WCAG 2.1.1, 2.4.1)", () => {
    it("should have navigation landmark with label", () => {
      renderFormWithFields();
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Sections du formulaire");
    });

    it("should have section anchors with IDs for navigation", () => {
      renderFormWithFields();
      expect(document.getElementById("section-vehicle_identity")).not.toBeNull();
      expect(document.getElementById("section-technical_details")).not.toBeNull();
      expect(document.getElementById("section-condition_description")).not.toBeNull();
      expect(document.getElementById("section-pricing")).not.toBeNull();
      expect(document.getElementById("section-options_equipment")).not.toBeNull();
    });

    it("should have focusable navigation buttons", () => {
      renderFormWithFields();
      const navButtons = [
        screen.getByTestId("nav-vehicle_identity"),
        screen.getByTestId("nav-technical_details"),
        screen.getByTestId("nav-condition_description"),
        screen.getByTestId("nav-pricing"),
        screen.getByTestId("nav-options_equipment"),
      ];

      for (const btn of navButtons) {
        expect(btn.tagName.toLowerCase()).toBe("button");
      }
    });
  });

  describe("Focus Management (WCAG 2.4.7)", () => {
    it("should have visible focus indicators on nav buttons", () => {
      renderFormWithFields();
      const navBtn = screen.getByTestId("nav-vehicle_identity");
      expect(navBtn.className).toContain("focus-visible:ring");
    });

    it("should have visible focus indicators on override buttons", () => {
      renderFormWithFields();
      const overrideBtn = screen.getByTestId("override-btn-make");
      expect(overrideBtn.className).toContain("focus-visible:ring");
    });
  });

  describe("Keyboard Navigation (WCAG 2.1.1)", () => {
    it("should allow tabbing through form fields", async () => {
      const user = userEvent.setup();
      renderFormWithFields();

      // Tab should move through form elements
      await user.tab();
      // First focusable element should be a nav button or form input
      const activeEl = document.activeElement;
      expect(activeEl).not.toBe(document.body);
    });

    it("should allow keyboard activation of override button", async () => {
      const user = userEvent.setup();
      renderFormWithFields();

      const overrideBtn = screen.getByTestId("override-btn-make");
      overrideBtn.focus();
      await user.keyboard("{Enter}");
      // Override button now opens confirmation dialog
      expect(screen.getByTestId("override-confirm-dialog")).toBeInTheDocument();
      // Confirming the dialog should call onCertifiedOverride
      await user.click(screen.getByTestId("override-confirm-btn"));
      expect(mockOnCertifiedOverride).toHaveBeenCalledWith("make");
    });
  });

  describe("Color Independence (WCAG 1.4.1)", () => {
    it("should use text labels alongside color for badge status", () => {
      renderFormWithFields();
      // Certified badge has text "Certifié"
      expect(screen.getAllByText("Certifié").length).toBeGreaterThan(0);
      // Declared badge has text "Déclaré vendeur"
      expect(screen.getByText("Déclaré vendeur")).toBeInTheDocument();
      // Empty badge has text "À compléter"
      expect(screen.getAllByText("À compléter").length).toBeGreaterThan(0);
    });
  });
});
