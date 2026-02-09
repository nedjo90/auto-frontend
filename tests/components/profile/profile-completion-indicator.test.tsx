import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileCompletionIndicator } from "@/components/profile/profile-completion-indicator";
import type { IProfileCompletionResult } from "@auto/shared";

describe("ProfileCompletionIndicator", () => {
  afterEach(() => cleanup());

  const fullCompletion: IProfileCompletionResult = {
    percentage: 100,
    badge: "complete",
    incompleteFields: [],
  };

  const partialCompletion: IProfileCompletionResult = {
    percentage: 45,
    badge: "intermediate",
    incompleteFields: [
      { fieldName: "phone", tipKey: "profile.tip.phone" },
      { fieldName: "siret", tipKey: "profile.tip.siret" },
    ],
  };

  it("renders percentage", () => {
    render(<ProfileCompletionIndicator completion={fullCompletion} />);
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders badge label", () => {
    render(<ProfileCompletionIndicator completion={fullCompletion} />);
    expect(screen.getByText("Profil complet")).toBeInTheDocument();
  });

  it("renders intermediate badge", () => {
    render(<ProfileCompletionIndicator completion={partialCompletion} />);
    expect(screen.getByText("Profil intermédiaire")).toBeInTheDocument();
  });

  it("shows expandable incomplete fields section", () => {
    render(<ProfileCompletionIndicator completion={partialCompletion} />);
    expect(screen.getByText("2 champs à compléter")).toBeInTheDocument();
  });

  it("does not show expand button when all fields complete", () => {
    render(<ProfileCompletionIndicator completion={fullCompletion} />);
    expect(screen.queryByText(/champ.*à compléter/)).not.toBeInTheDocument();
  });

  it("expands to show tips when clicked", async () => {
    const user = userEvent.setup();
    render(<ProfileCompletionIndicator completion={partialCompletion} />);

    const expandButton = screen.getByText("2 champs à compléter");
    await user.click(expandButton);

    expect(screen.getByText(/Ajoutez votre numéro de téléphone/)).toBeInTheDocument();
    expect(screen.getByText(/Ajoutez votre numéro SIRET/)).toBeInTheDocument();
  });
});
