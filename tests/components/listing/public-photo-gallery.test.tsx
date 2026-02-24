import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PublicPhotoGallery } from "@/components/listing/public-photo-gallery";
import type { IListingPhoto } from "@auto/shared";

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

const makePhoto = (id: string, order: number, isPrimary = false): IListingPhoto => ({
  ID: id,
  listingId: "listing-1",
  blobUrl: `blob://${id}`,
  cdnUrl: `https://cdn.example.com/${id}.jpg`,
  sortOrder: order,
  isPrimary,
  fileSize: 100000,
  mimeType: "image/jpeg",
  width: 1200,
  height: 800,
  uploadedAt: "2026-01-01",
});

describe("PublicPhotoGallery", () => {
  it("should render empty state when no photos", () => {
    render(<PublicPhotoGallery photos={[]} title="Test Car" />);
    expect(screen.getByTestId("gallery-empty")).toBeInTheDocument();
    expect(screen.getByText("Pas de photo disponible")).toBeInTheDocument();
  });

  it("should render single photo without navigation", () => {
    const photos = [makePhoto("p1", 0, true)];
    render(<PublicPhotoGallery photos={photos} title="Renault Clio" />);

    expect(screen.getByTestId("gallery-main-image")).toBeInTheDocument();
    expect(screen.queryByTestId("gallery-prev")).not.toBeInTheDocument();
    expect(screen.queryByTestId("gallery-next")).not.toBeInTheDocument();
    expect(screen.queryByTestId("gallery-thumbnails")).not.toBeInTheDocument();
  });

  it("should render multiple photos with navigation", () => {
    const photos = [makePhoto("p1", 0, true), makePhoto("p2", 1), makePhoto("p3", 2)];
    render(<PublicPhotoGallery photos={photos} title="Renault Clio" />);

    expect(screen.getByTestId("gallery-prev")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-next")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-thumbnails")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("should navigate to next photo", () => {
    const photos = [makePhoto("p1", 0, true), makePhoto("p2", 1)];
    render(<PublicPhotoGallery photos={photos} title="Test" />);

    fireEvent.click(screen.getByTestId("gallery-next"));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });

  it("should navigate to previous photo", () => {
    const photos = [makePhoto("p1", 0, true), makePhoto("p2", 1)];
    render(<PublicPhotoGallery photos={photos} title="Test" />);

    // Go to second
    fireEvent.click(screen.getByTestId("gallery-next"));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    // Go back
    fireEvent.click(screen.getByTestId("gallery-prev"));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("should disable prev button on first photo", () => {
    const photos = [makePhoto("p1", 0), makePhoto("p2", 1)];
    render(<PublicPhotoGallery photos={photos} title="Test" />);

    expect(screen.getByTestId("gallery-prev")).toBeDisabled();
  });

  it("should disable next button on last photo", () => {
    const photos = [makePhoto("p1", 0), makePhoto("p2", 1)];
    render(<PublicPhotoGallery photos={photos} title="Test" />);

    fireEvent.click(screen.getByTestId("gallery-next"));
    expect(screen.getByTestId("gallery-next")).toBeDisabled();
  });

  it("should navigate via thumbnail click", () => {
    const photos = [makePhoto("p1", 0), makePhoto("p2", 1), makePhoto("p3", 2)];
    render(<PublicPhotoGallery photos={photos} title="Test" />);

    fireEvent.click(screen.getByTestId("gallery-thumb-2"));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("should render thumbnails for each photo", () => {
    const photos = [makePhoto("p1", 0), makePhoto("p2", 1), makePhoto("p3", 2)];
    render(<PublicPhotoGallery photos={photos} title="Test" />);

    expect(screen.getByTestId("gallery-thumb-0")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-thumb-1")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-thumb-2")).toBeInTheDocument();
  });
});
