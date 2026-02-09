import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCardSkeleton } from "@/components/admin/kpi-card-skeleton";

describe("KpiCardSkeleton", () => {
  it("should render skeleton card with test id", () => {
    render(<KpiCardSkeleton />);
    expect(screen.getByTestId("kpi-card-skeleton")).toBeInTheDocument();
  });

  it("should render animated skeleton elements", () => {
    const { container } = render(<KpiCardSkeleton />);
    const skeletons = container.querySelectorAll("[data-slot='skeleton']");
    expect(skeletons.length).toBe(3);
  });
});
