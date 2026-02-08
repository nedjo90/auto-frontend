import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UnauthorizedPage from "@/app/(dashboard)/unauthorized/page";

describe("UnauthorizedPage", () => {
  it("renders unauthorized message", () => {
    render(<UnauthorizedPage />);
    expect(screen.getByText("Acces non autorise")).toBeInTheDocument();
    expect(
      screen.getByText("Vous n'avez pas les droits necessaires pour acceder a cette page."),
    ).toBeInTheDocument();
  });

  it("renders link back to dashboard", () => {
    render(<UnauthorizedPage />);
    const links = screen.getAllByText("Retour au tableau de bord");
    const anchor = links.find((el) => el.closest("a"));
    expect(anchor).toBeDefined();
    expect(anchor!.closest("a")).toHaveAttribute("href", "/dashboard");
  });
});
