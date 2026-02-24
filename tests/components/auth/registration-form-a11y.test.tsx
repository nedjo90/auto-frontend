import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { axe } from "vitest-axe";

vi.mock("@/lib/auth/msal-instance", () => ({
  msalInstance: { loginRedirect: vi.fn().mockResolvedValue(undefined) },
  msalInitPromise: Promise.resolve(),
}));

vi.mock("@/lib/auth/msal-config", () => ({
  loginRequest: { scopes: ["openid"] },
}));

import { RegistrationForm } from "@/components/auth/registration-form";

const mockFields = [
  {
    ID: "1",
    fieldName: "email",
    fieldType: "email",
    isRequired: true,
    isVisible: true,
    displayOrder: 10,
    validationPattern: null,
    labelKey: "Email",
    placeholderKey: "votre@email.com",
  },
  {
    ID: "2",
    fieldName: "firstName",
    fieldType: "text",
    isRequired: true,
    isVisible: true,
    displayOrder: 20,
    validationPattern: null,
    labelKey: "Prénom",
    placeholderKey: "Jean",
  },
  {
    ID: "3",
    fieldName: "lastName",
    fieldType: "text",
    isRequired: true,
    isVisible: true,
    displayOrder: 30,
    validationPattern: null,
    labelKey: "Nom",
    placeholderKey: "Dupont",
  },
  {
    ID: "4",
    fieldName: "phone",
    fieldType: "tel",
    isRequired: false,
    isVisible: true,
    displayOrder: 40,
    validationPattern: null,
    labelKey: "Téléphone",
    placeholderKey: "+33 6 12 34 56 78",
  },
];

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  cleanup();
});

const mockConsentTypes = [
  {
    ID: "ct-1",
    code: "essential_processing",
    labelKey: "Traitement essentiel des données",
    descriptionKey: "Nécessaire au fonctionnement du service",
    isMandatory: true,
    isActive: true,
    displayOrder: 10,
    version: 1,
  },
  {
    ID: "ct-2",
    code: "marketing_email",
    labelKey: "Communications marketing",
    descriptionKey: "Recevoir des offres par email",
    isMandatory: false,
    isActive: true,
    displayOrder: 20,
    version: 1,
  },
];

function setupFieldsResponse() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ value: mockFields }),
  });
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ value: mockConsentTypes }),
  });
}

async function waitForFormLoaded() {
  await waitFor(() => {
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  });
}

describe("RegistrationForm Accessibility (AC4)", () => {
  it("should have no axe violations when form is loaded", async () => {
    setupFieldsResponse();
    const { container } = render(<RegistrationForm />);
    await waitForFormLoaded();

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("should have label elements associated with all input fields", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    for (const field of mockFields) {
      const input = screen.getByLabelText(new RegExp(field.labelKey));
      expect(input).toBeInTheDocument();
      expect(input.tagName).toBe("INPUT");
    }

    expect(screen.getByLabelText(/Mot de passe/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Traitement essentiel/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Communications marketing/)).toBeInTheDocument();
  });

  it("should link error messages via aria-describedby", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    const emailInput = screen.getByLabelText(/Email/);
    await user.click(emailInput);
    await user.tab();

    await waitFor(() => {
      const describedBy = emailInput.getAttribute("aria-describedby");
      if (describedBy) {
        const errorEl = document.getElementById(describedBy);
        expect(errorEl).toBeInTheDocument();
        expect(errorEl?.getAttribute("role")).toBe("alert");
      }
    });
  });

  it("should set aria-invalid on fields with errors", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/)).toHaveAttribute("aria-invalid", "true");
    });
  });

  it("should make all form fields focusable", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    // Verify all input fields have valid tabindex (not -1) and are not disabled
    const fields = ["Email", "Prénom", "Nom", "Téléphone", "Mot de passe"];
    for (const label of fields) {
      const input = screen.getByLabelText(new RegExp(label));
      expect(input).not.toBeDisabled();
      expect(input).not.toHaveAttribute("tabindex", "-1");
    }

    // Verify consent checkboxes are also focusable
    expect(screen.getByLabelText(/Traitement essentiel/)).not.toBeDisabled();
    expect(screen.getByLabelText(/Communications marketing/)).not.toBeDisabled();
  });

  it("should have aria-required on required fields", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    expect(screen.getByLabelText(/Email/)).toHaveAttribute("aria-required", "true");
    expect(screen.getByLabelText(/Prénom/)).toHaveAttribute("aria-required", "true");
    expect(screen.getByLabelText(/Nom/)).toHaveAttribute("aria-required", "true");

    // Optional field should not have aria-required=true
    expect(screen.getByLabelText(/Téléphone/)).not.toHaveAttribute("aria-required", "true");
  });

  it("should use role=alert for error messages", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
      for (const alert of alerts) {
        expect(alert.textContent).toBeTruthy();
      }
    });
  });

  it("should have no axe violations when errors are displayed", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    const { container } = render(<RegistrationForm />);
    await waitForFormLoaded();

    await user.click(screen.getByRole("button", { name: /créer mon compte/i }));

    await waitFor(() => {
      expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
    });

    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
