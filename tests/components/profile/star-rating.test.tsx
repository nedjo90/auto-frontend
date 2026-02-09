import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { StarRating } from "@/components/ui/star-rating";

describe("StarRating", () => {
  afterEach(() => cleanup());

  it("renders correct number of stars", () => {
    const { container } = render(<StarRating rating={3} maxRating={5} />);
    const stars = container.querySelectorAll("svg");
    expect(stars).toHaveLength(5);
  });

  it("renders aria label with rating", () => {
    render(<StarRating rating={4.2} />);
    const element = screen.getByRole("img");
    expect(element).toHaveAttribute("aria-label", "4.2 sur 5 étoiles");
  });

  it("supports custom maxRating", () => {
    const { container } = render(<StarRating rating={2} maxRating={3} />);
    const stars = container.querySelectorAll("svg");
    expect(stars).toHaveLength(3);
  });

  it("renders with sm size", () => {
    const { container } = render(<StarRating rating={3} size="sm" />);
    const star = container.querySelector("svg");
    expect(star?.classList.toString()).toContain("size-3");
  });

  it("renders with lg size", () => {
    const { container } = render(<StarRating rating={3} size="lg" />);
    const star = container.querySelector("svg");
    expect(star?.classList.toString()).toContain("size-5");
  });
});
