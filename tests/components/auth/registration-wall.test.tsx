import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

import { RegistrationWall } from "@/components/auth/registration-wall";

describe("RegistrationWall", () => {
  it("renders the CTA message", () => {
    render(<RegistrationWall />);
    expect(
      screen.getByText(/Connectez-vous ou cr.+ez un compte pour acc.+der .+ cette fonctionnalit/),
    ).toBeInTheDocument();
  });

  it("renders login link to /login", () => {
    render(<RegistrationWall />);
    const links = screen.getAllByText(/Se connecter/i);
    const anchor = links.find((el) => el.closest("a"));
    expect(anchor).toBeDefined();
    expect(anchor!.closest("a")).toHaveAttribute("href", "/login");
  });

  it("renders register link to /register", () => {
    render(<RegistrationWall />);
    const links = screen.getAllByText(/un compte/i);
    const anchor = links.find((el) => el.closest("a"));
    expect(anchor).toBeDefined();
    expect(anchor!.closest("a")).toHaveAttribute("href", "/register");
  });

  it("applies blur overlay styling", () => {
    const { container } = render(<RegistrationWall />);
    const overlay = container.querySelector("[class*='blur']");
    expect(overlay).not.toBeNull();
  });

  it("renders children behind the wall as teaser", () => {
    render(
      <RegistrationWall>
        <div>Hidden Content</div>
      </RegistrationWall>,
    );
    expect(screen.getByText("Hidden Content")).toBeInTheDocument();
  });
});
