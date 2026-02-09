import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PublicSellerCard } from "@/components/profile/public-seller-card";
import type { IPublicSellerProfile } from "@auto/shared";

describe("PublicSellerCard", () => {
  afterEach(() => cleanup());

  const activeSeller: IPublicSellerProfile = {
    userId: "seller-1",
    displayName: "Marie Dupont",
    avatarUrl: null,
    bio: "Vendeuse pro",
    rating: 4.2,
    profileCompletionBadge: "advanced",
    totalListings: 5,
    memberSince: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    isAnonymized: false,
  };

  const anonymizedSeller: IPublicSellerProfile = {
    userId: "seller-2",
    displayName: "Utilisateur anonymisé",
    avatarUrl: null,
    bio: null,
    rating: 0,
    profileCompletionBadge: "new_seller",
    totalListings: 0,
    memberSince: "2024-01-01T00:00:00Z",
    isAnonymized: true,
  };

  it("renders seller display name", () => {
    render(<PublicSellerCard seller={activeSeller} />);
    expect(screen.getByText("Marie Dupont")).toBeInTheDocument();
  });

  it("renders rating", () => {
    render(<PublicSellerCard seller={activeSeller} />);
    expect(screen.getByText("(4.2)")).toBeInTheDocument();
  });

  it("renders profile completion badge", () => {
    render(<PublicSellerCard seller={activeSeller} />);
    expect(screen.getByText("Profil avancé")).toBeInTheDocument();
  });

  it("renders listing count", () => {
    render(<PublicSellerCard seller={activeSeller} />);
    expect(screen.getByText("5 annonces")).toBeInTheDocument();
  });

  it("links to seller profile page", () => {
    render(<PublicSellerCard seller={activeSeller} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/sellers/seller-1");
  });

  it("renders anonymized placeholder", () => {
    render(<PublicSellerCard seller={anonymizedSeller} />);
    expect(screen.getByText("Utilisateur anonymisé")).toBeInTheDocument();
  });

  it("does not render link for anonymized seller", () => {
    render(<PublicSellerCard seller={anonymizedSeller} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders singular 'annonce' for 1 listing", () => {
    const singleListing = { ...activeSeller, totalListings: 1 };
    render(<PublicSellerCard seller={singleListing} />);
    expect(screen.getByText("1 annonce")).toBeInTheDocument();
  });
});
