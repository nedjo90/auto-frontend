import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ListingCardSkeleton,
  ListingCardSkeletonGrid,
} from "@/components/listing/listing-card-skeleton";

describe("ListingCardSkeleton", () => {
  it("should render skeleton card", () => {
    render(<ListingCardSkeleton />);
    expect(screen.getByTestId("listing-card-skeleton")).toBeInTheDocument();
  });
});

describe("ListingCardSkeletonGrid", () => {
  it("should render grid with default count", () => {
    render(<ListingCardSkeletonGrid />);
    expect(screen.getByTestId("listing-skeleton-grid")).toBeInTheDocument();
    expect(screen.getAllByTestId("listing-card-skeleton")).toHaveLength(6);
  });

  it("should render grid with custom count", () => {
    render(<ListingCardSkeletonGrid count={3} />);
    expect(screen.getAllByTestId("listing-card-skeleton")).toHaveLength(3);
  });
});
