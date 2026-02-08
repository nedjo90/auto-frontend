import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ConsentStep, type ConsentDecisions } from "@/components/auth/consent-step";
import type { IConfigConsentType } from "@auto/shared";

const mockConsentTypes: IConfigConsentType[] = [
  {
    ID: "ct-1",
    code: "essential_processing",
    labelKey: "Traitement essentiel des données",
    descriptionKey: "Nécessaire au fonctionnement du service",
    isMandatory: true,
    isActive: true,
    displayOrder: 10,
    version: 1,
    createdAt: "",
    modifiedAt: "",
    createdBy: "",
    modifiedBy: "",
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
    createdAt: "",
    modifiedAt: "",
    createdBy: "",
    modifiedBy: "",
  },
];

afterEach(() => {
  cleanup();
});

describe("ConsentStep", () => {
  it("should render consent types as checkboxes", () => {
    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{}}
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText(/Traitement essentiel/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Communications marketing/)).toBeInTheDocument();
  });

  it("should render nothing when no consent types", () => {
    const { container } = render(
      <ConsentStep consentTypes={[]} value={{}} onChange={() => {}} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("should mark mandatory consents with asterisk", () => {
    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{}}
        onChange={() => {}}
      />,
    );

    // Mandatory consent has * marker
    const mandatory = screen.getByLabelText(/Traitement essentiel/);
    expect(mandatory.closest("div")?.textContent).toContain("*");
  });

  it("should mark optional consents with (optionnel)", () => {
    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{}}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("(optionnel)")).toBeInTheDocument();
  });

  it("should set aria-required on mandatory consents", () => {
    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{}}
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText(/Traitement essentiel/)).toHaveAttribute(
      "aria-required",
      "true",
    );
  });

  it("should call onChange when checkbox is toggled", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{}}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText(/Communications marketing/));
    expect(onChange).toHaveBeenCalledWith({ "ct-2": true });
  });

  it("should display checked state from value prop", () => {
    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{ "ct-1": true, "ct-2": false }}
        onChange={() => {}}
      />,
    );

    const essential = screen.getByLabelText(/Traitement essentiel/);
    expect(essential).toHaveAttribute("data-state", "checked");

    const marketing = screen.getByLabelText(/Communications marketing/);
    expect(marketing).toHaveAttribute("data-state", "unchecked");
  });

  it("should never pre-check checkboxes (RGPD)", () => {
    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{}}
        onChange={() => {}}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    for (const cb of checkboxes) {
      expect(cb).toHaveAttribute("data-state", "unchecked");
    }
  });

  it("should display error messages", () => {
    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{}}
        onChange={() => {}}
        errors={{ "ct-1": "Ce consentement est requis" }}
      />,
    );

    expect(screen.getByText("Ce consentement est requis")).toBeInTheDocument();
    expect(screen.getByText("Ce consentement est requis")).toHaveAttribute(
      "role",
      "alert",
    );
  });

  it("should toggle description visibility", async () => {
    const user = userEvent.setup();
    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{}}
        onChange={() => {}}
      />,
    );

    // Description not visible initially
    expect(
      screen.queryByText("Nécessaire au fonctionnement du service"),
    ).not.toBeInTheDocument();

    // Click "Voir les détails"
    const detailButtons = screen.getAllByText("Voir les détails");
    await user.click(detailButtons[0]);

    expect(
      screen.getByText("Nécessaire au fonctionnement du service"),
    ).toBeInTheDocument();
  });

  it("should disable all checkboxes when disabled prop is true", () => {
    render(
      <ConsentStep
        consentTypes={mockConsentTypes}
        value={{}}
        onChange={() => {}}
        disabled={true}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    for (const cb of checkboxes) {
      expect(cb).toBeDisabled();
    }
  });
});
