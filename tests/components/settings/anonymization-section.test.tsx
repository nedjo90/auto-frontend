import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnonymizationSection } from "@/components/settings/anonymization-section";

describe("AnonymizationSection", () => {
  afterEach(() => cleanup());

  it("renders section title", () => {
    render(<AnonymizationSection />);
    expect(screen.getByRole("heading", { name: "Anonymiser mon compte" })).toBeInTheDocument();
  });

  it("renders warning about irreversibility", () => {
    render(<AnonymizationSection />);
    expect(screen.getByText(/irréversible/)).toBeInTheDocument();
  });

  it("lists anonymization fields", () => {
    render(<AnonymizationSection />);
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("firstName")).toBeInTheDocument();
    expect(screen.getByText("siret")).toBeInTheDocument();
  });

  it("lists preserved data", () => {
    render(<AnonymizationSection />);
    expect(screen.getByText(/Annonces publiées/)).toBeInTheDocument();
    expect(screen.getByText(/consentements/)).toBeInTheDocument();
  });

  it("opens confirmation dialog on button click", async () => {
    const user = userEvent.setup();
    render(<AnonymizationSection />);

    const button = screen.getAllByText("Anonymiser mon compte")[1]; // Button, not heading
    await user.click(button);

    expect(screen.getByText("Confirmer l'anonymisation")).toBeInTheDocument();
  });
});
