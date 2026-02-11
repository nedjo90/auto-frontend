import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeoPreview } from "@/components/admin/seo-preview";

describe("SeoPreview", () => {
  it("should render SERP-style preview with sample data", () => {
    render(
      <SeoPreview
        metaTitleTemplate="{{brand}} {{model}} - Auto"
        metaDescriptionTemplate="Achetez {{brand}} {{model}}"
        pageType="listing_detail"
      />,
    );

    expect(screen.getByTestId("seo-preview")).toBeInTheDocument();
    expect(screen.getByTestId("seo-preview-title")).toHaveTextContent("Peugeot 308 - Auto");
    expect(screen.getByTestId("seo-preview-description")).toHaveTextContent("Achetez Peugeot 308");
    expect(screen.getByTestId("seo-preview-url")).toHaveTextContent("auto.fr");
  });

  it("should show character count for title and description", () => {
    render(
      <SeoPreview
        metaTitleTemplate="Short"
        metaDescriptionTemplate="Also short"
        pageType="landing_page"
      />,
    );

    const charCounts = screen.getByTestId("seo-char-counts");
    expect(charCounts).toHaveTextContent("Titre :");
    expect(charCounts).toHaveTextContent("Description :");
    expect(charCounts).toHaveTextContent("/60");
    expect(charCounts).toHaveTextContent("/160");
  });

  it("should show warning when title exceeds 60 characters", () => {
    const longTitle = "A".repeat(70) + " - {{title}}";
    render(
      <SeoPreview
        metaTitleTemplate={longTitle}
        metaDescriptionTemplate="Short"
        pageType="landing_page"
      />,
    );

    const charCounts = screen.getByTestId("seo-char-counts");
    expect(charCounts).toHaveTextContent("trop long");
  });

  it("should show warning when description exceeds 160 characters", () => {
    const longDesc = "B".repeat(170) + " {{title}}";
    render(
      <SeoPreview
        metaTitleTemplate="Short"
        metaDescriptionTemplate={longDesc}
        pageType="landing_page"
      />,
    );

    const charCounts = screen.getByTestId("seo-char-counts");
    expect(charCounts).toHaveTextContent("trop long");
  });

  it("should not show warning when within limits", () => {
    render(
      <SeoPreview
        metaTitleTemplate="{{brand}} - Auto"
        metaDescriptionTemplate="Desc for {{brand}}"
        pageType="brand_page"
      />,
    );

    const charCounts = screen.getByTestId("seo-char-counts");
    expect(charCounts.textContent).not.toContain("trop long");
  });

  it("should render with search_results sample data", () => {
    render(
      <SeoPreview
        metaTitleTemplate="{{query}} - {{count}} resultats"
        metaDescriptionTemplate="Trouvez {{query}} a {{city}}"
        pageType="search_results"
      />,
    );

    expect(screen.getByTestId("seo-preview-title")).toHaveTextContent("SUV diesel - 142 resultats");
    expect(screen.getByTestId("seo-preview-description")).toHaveTextContent(
      "Trouvez SUV diesel a Lyon",
    );
  });

  it("should show placeholder text for empty templates", () => {
    render(
      <SeoPreview metaTitleTemplate="" metaDescriptionTemplate="" pageType="listing_detail" />,
    );

    expect(screen.getByTestId("seo-preview-title")).toHaveTextContent("Titre meta");
    expect(screen.getByTestId("seo-preview-description")).toHaveTextContent("Description meta");
  });
});
