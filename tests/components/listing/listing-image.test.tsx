import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ListingImage } from "@/components/listing/listing-image";

describe("ListingImage", () => {
  beforeEach(() => {
    cleanup();
  });

  it("should render an img element", () => {
    render(
      <ListingImage src="https://cdn.auto-platform.fr/listings/test/photo.jpg" alt="Test photo" />,
    );
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Test photo");
  });

  it("should use lazy loading by default", () => {
    render(<ListingImage src="https://cdn.auto-platform.fr/listings/test/photo.jpg" alt="Test" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("should use eager loading when priority is true", () => {
    render(
      <ListingImage
        src="https://cdn.auto-platform.fr/listings/test/photo.jpg"
        alt="Test"
        priority
      />,
    );
    const img = screen.getByRole("img");
    // Next.js sets loading to "eager" for priority images
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("should set responsive sizes for thumbnail variant", () => {
    render(
      <ListingImage
        src="https://cdn.auto-platform.fr/listings/test/photo.jpg"
        alt="Test"
        variant="thumbnail"
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("sizes");
    expect(img.getAttribute("sizes")).toContain("50vw");
  });

  it("should set responsive sizes for full variant", () => {
    render(
      <ListingImage
        src="https://cdn.auto-platform.fr/listings/test/photo.jpg"
        alt="Test"
        variant="full"
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("sizes");
    expect(img.getAttribute("sizes")).toContain("60vw");
  });

  it("should apply custom className", () => {
    render(
      <ListingImage
        src="https://cdn.auto-platform.fr/listings/test/photo.jpg"
        alt="Test"
        className="rounded-lg"
      />,
    );
    const img = screen.getByRole("img");
    expect(img.className).toContain("rounded-lg");
  });

  it("should set width and height for medium variant", () => {
    render(
      <ListingImage
        src="https://cdn.auto-platform.fr/listings/test/photo.jpg"
        alt="Test"
        variant="medium"
      />,
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "640");
    expect(img).toHaveAttribute("height", "480");
  });
});

describe("Next.js Image CDN Configuration", () => {
  it("should have Azure CDN domain in next.config", async () => {
    // Read the next.config.ts to verify CDN configuration
    const fs = await import("fs");
    const path = await import("path");
    const configPath = path.resolve(__dirname, "../../../next.config.ts");
    const content = fs.readFileSync(configPath, "utf-8");

    expect(content).toContain("cdn.auto-platform.fr");
    expect(content).toContain("blob.core.windows.net");
    expect(content).toContain("remotePatterns");
  });
});
