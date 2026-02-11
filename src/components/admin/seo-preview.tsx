"use client";

import type { SeoPageType } from "@auto/shared";
import { SEO_SAMPLE_DATA, SEO_CHAR_LIMITS, renderSeoTemplate } from "@auto/shared";

interface SeoPreviewProps {
  metaTitleTemplate: string;
  metaDescriptionTemplate: string;
  pageType: SeoPageType;
}

export function SeoPreview({
  metaTitleTemplate,
  metaDescriptionTemplate,
  pageType,
}: SeoPreviewProps) {
  const sampleData = SEO_SAMPLE_DATA[pageType];
  const renderedTitle = renderSeoTemplate(metaTitleTemplate, sampleData);
  const renderedDescription = renderSeoTemplate(metaDescriptionTemplate, sampleData);

  const titleOverLimit = renderedTitle.length > SEO_CHAR_LIMITS.metaTitle;
  const descriptionOverLimit = renderedDescription.length > SEO_CHAR_LIMITS.metaDescription;

  return (
    <div className="space-y-3" data-testid="seo-preview">
      <p className="text-xs font-medium text-muted-foreground">Apercu Google (donnees exemples)</p>

      <div className="rounded-md border bg-background p-4 space-y-1">
        <p
          className="text-lg text-blue-700 leading-tight line-clamp-1"
          data-testid="seo-preview-title"
        >
          {renderedTitle || "Titre meta"}
        </p>
        <p className="text-sm text-green-700" data-testid="seo-preview-url">
          auto.fr
        </p>
        <p
          className="text-sm text-muted-foreground line-clamp-2"
          data-testid="seo-preview-description"
        >
          {renderedDescription || "Description meta"}
        </p>
      </div>

      <div className="flex gap-4 text-xs" data-testid="seo-char-counts">
        <span className={titleOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}>
          Titre : {renderedTitle.length}/{SEO_CHAR_LIMITS.metaTitle} car.
          {titleOverLimit && " (trop long)"}
        </span>
        <span
          className={
            descriptionOverLimit ? "text-destructive font-medium" : "text-muted-foreground"
          }
        >
          Description : {renderedDescription.length}/{SEO_CHAR_LIMITS.metaDescription} car.
          {descriptionOverLimit && " (trop long)"}
        </span>
      </div>
    </div>
  );
}
