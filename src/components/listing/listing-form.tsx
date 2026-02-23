"use client";

import { useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LISTING_FIELDS, FIELD_CATEGORY_LABELS, FIELD_CATEGORY_ORDER } from "@auto/shared";
import type { FieldCategory } from "@auto/shared";
import type { ListingFieldState } from "@auto/shared";
import { ListingFormField } from "./listing-form-field";

export interface ListingFormProps {
  fields: Record<string, ListingFieldState>;
  visibilityScore: number;
  onFieldChange: (fieldName: string, value: string) => void;
  onCertifiedOverride: (fieldName: string) => void;
  isLoading?: boolean;
}

/**
 * Single scrollable listing form with section anchors.
 * Displays certified, declared, and incomplete fields.
 */
export function ListingForm({
  fields,
  visibilityScore,
  onFieldChange,
  onCertifiedOverride,
  isLoading = false,
}: ListingFormProps) {
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToSection = useCallback((category: FieldCategory) => {
    const el = sectionRefs.current[category];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Group fields by category
  const fieldsByCategory = FIELD_CATEGORY_ORDER.map((category) => ({
    category,
    label: FIELD_CATEGORY_LABELS[category],
    fields: LISTING_FIELDS.filter((f) => f.category === category),
  }));

  return (
    <div className="space-y-6" data-testid="listing-form">
      {/* Section Navigation */}
      <nav
        className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b pb-3 pt-3"
        aria-label="Sections du formulaire"
        data-testid="section-nav"
      >
        <div className="flex gap-2 flex-wrap">
          {FIELD_CATEGORY_ORDER.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => scrollToSection(category)}
              className="text-sm px-3 py-1 rounded-full border hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              data-testid={`nav-${category}`}
            >
              {FIELD_CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>

        {/* Visibility Score */}
        <div className="mt-2 flex items-center gap-2" data-testid="visibility-score">
          <span className="text-sm text-muted-foreground">Score de visibilité:</span>
          <Badge
            variant={
              visibilityScore >= 80 ? "default" : visibilityScore >= 50 ? "secondary" : "outline"
            }
            className={cn(
              visibilityScore >= 80 && "bg-green-600 text-white",
              visibilityScore >= 50 && visibilityScore < 80 && "bg-yellow-500 text-black",
            )}
            aria-label={`Score de visibilité: ${visibilityScore} sur 100`}
          >
            {visibilityScore}%
          </Badge>
        </div>
      </nav>

      {/* Form Sections */}
      {fieldsByCategory.map(({ category, label, fields: categoryFields }) => (
        <section
          key={category}
          ref={(el) => {
            sectionRefs.current[category] = el;
          }}
          id={`section-${category}`}
          aria-labelledby={`heading-${category}`}
          className="space-y-4"
          data-testid={`section-${category}`}
        >
          <h2 id={`heading-${category}`} className="text-lg font-semibold border-b pb-2">
            {label}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {categoryFields.map((fieldMeta) => {
              const fieldState = fields[fieldMeta.fieldName];
              return (
                <ListingFormField
                  key={fieldMeta.fieldName}
                  fieldMeta={fieldMeta}
                  fieldState={fieldState}
                  onFieldChange={onFieldChange}
                  onCertifiedOverride={onCertifiedOverride}
                  disabled={isLoading}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
