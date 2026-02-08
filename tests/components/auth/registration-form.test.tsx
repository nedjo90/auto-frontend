import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  cleanup();
});

function setupFieldsResponse() {
  // Registration fields
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ value: mockFields }),
  });
  // Consent types
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

describe("RegistrationForm", () => {
  it("should show loading spinner initially", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<RegistrationForm />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should render dynamic fields from API", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    expect(screen.getByLabelText(/Prénom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Téléphone/)).toBeInTheDocument();
  });

  it("should mark required fields with aria-required", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    expect(screen.getByLabelText(/Email/)).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByLabelText(/Prénom/)).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("should label optional fields with (optionnel)", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    // phone field + marketing checkbox both have (optionnel)
    const optionalLabels = screen.getAllByText("(optionnel)");
    expect(optionalLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("should render password field", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    expect(screen.getByLabelText(/Mot de passe/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/)).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("should render config-driven consent checkboxes", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    expect(
      screen.getByLabelText(/Traitement essentiel/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Communications marketing/),
    ).toBeInTheDocument();
  });

  it("should render submit button", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    expect(
      screen.getByRole("button", { name: /créer mon compte/i }),
    ).toBeInTheDocument();
  });

  it("should show error when API fails to load fields", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ value: [] }) });
    render(<RegistrationForm />);

    await waitFor(() => {
      expect(
        screen.getByText("Impossible de charger le formulaire"),
      ).toBeInTheDocument();
    });
  });

  it("should show validation errors on submit with empty fields", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    await user.click(
      screen.getByRole("button", { name: /créer mon compte/i }),
    );

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  it("should set aria-invalid on invalid fields", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    // Focus and blur email to trigger validation
    const emailInput = screen.getByLabelText(/Email/);
    await user.click(emailInput);
    await user.tab();

    await waitFor(() => {
      expect(emailInput).toHaveAttribute("aria-invalid", "true");
    });
  });

  it("should show spinner during form submission", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    await user.type(screen.getByLabelText(/Email/), "test@example.com");
    await user.type(screen.getByLabelText(/Prénom/), "Jean");
    await user.type(screen.getByLabelText(/Nom/), "Dupont");
    await user.type(
      screen.getByLabelText(/Mot de passe/),
      "SecureP@ss1",
    );
    // Check mandatory consent
    await user.click(screen.getByLabelText(/Traitement essentiel/));

    // Mock slow registration
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    await user.click(
      screen.getByRole("button", { name: /créer mon compte/i }),
    );

    await waitFor(() => {
      expect(screen.getByText(/inscription en cours/i)).toBeInTheDocument();
    });
  });

  it("should show server error on registration failure", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    await user.type(screen.getByLabelText(/Email/), "test@example.com");
    await user.type(screen.getByLabelText(/Prénom/), "Jean");
    await user.type(screen.getByLabelText(/Nom/), "Dupont");
    await user.type(
      screen.getByLabelText(/Mot de passe/),
      "SecureP@ss1",
    );
    // Check mandatory consent
    await user.click(screen.getByLabelText(/Traitement essentiel/));

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () =>
        Promise.resolve({
          error: { message: "Email already registered" },
        }),
    });

    await user.click(
      screen.getByRole("button", { name: /créer mon compte/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Email already registered"),
      ).toBeInTheDocument();
    });
  });

  it("should call consent API after successful registration", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    await user.type(screen.getByLabelText(/Email/), "test@example.com");
    await user.type(screen.getByLabelText(/Prénom/), "Jean");
    await user.type(screen.getByLabelText(/Nom/), "Dupont");
    await user.type(
      screen.getByLabelText(/Mot de passe/),
      "SecureP@ss1",
    );
    await user.click(screen.getByLabelText(/Traitement essentiel/));

    // Mock successful registration
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          userId: "user-123",
          email: "test@example.com",
          redirectUrl: "/auth/callback",
        }),
    });
    // Mock successful consent recording
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, count: 2 }),
    });

    await user.click(
      screen.getByRole("button", { name: /créer mon compte/i }),
    );

    await waitFor(() => {
      // 2 initial fetches (fields + consents) + registration + consent recording = 4 calls
      expect(mockFetch).toHaveBeenCalledTimes(4);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/consent/recordConsents"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("should show error when consent recording fails after registration", async () => {
    setupFieldsResponse();
    const user = userEvent.setup();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    await user.type(screen.getByLabelText(/Email/), "test@example.com");
    await user.type(screen.getByLabelText(/Prénom/), "Jean");
    await user.type(screen.getByLabelText(/Nom/), "Dupont");
    await user.type(
      screen.getByLabelText(/Mot de passe/),
      "SecureP@ss1",
    );
    await user.click(screen.getByLabelText(/Traitement essentiel/));

    // Mock successful registration
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          userId: "user-123",
          email: "test@example.com",
          redirectUrl: "/auth/callback",
        }),
    });
    // Mock failed consent recording
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await user.click(
      screen.getByRole("button", { name: /créer mon compte/i }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(/enregistrement des consentements/i),
      ).toBeInTheDocument();
    });
  });

  it("should use correct input types for field types", async () => {
    setupFieldsResponse();
    render(<RegistrationForm />);
    await waitForFormLoaded();

    expect(screen.getByLabelText(/Email/)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/Téléphone/)).toHaveAttribute("type", "tel");
    expect(screen.getByLabelText(/Prénom/)).toHaveAttribute("type", "text");
  });
});
