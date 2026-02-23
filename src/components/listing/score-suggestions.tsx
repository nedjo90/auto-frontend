"use client";

import { memo, useCallback, useMemo } from "react";
import { Lightbulb, ChevronRight, Sparkles, Camera, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScoreSuggestion } from "@auto/shared";
import { LISTING_FIELDS } from "@auto/shared";

export interface ScoreSuggestionsProps {
  suggestions: ScoreSuggestion[];
  className?: string;
}

/** Map field names to their form section IDs for scroll-to behavior. */
function getFieldSectionId(fieldName: string): string {
  const fieldMeta = LISTING_FIELDS.find((f) => f.fieldName === fieldName);
  if (fieldMeta) {
    return `section-${fieldMeta.category}`;
  }
  // Special non-field suggestions
  if (fieldName === "photo") return "section-photos";
  if (fieldName === "historyReport") return "section-history";
  if (fieldName === "descriptionBonus") return "section-condition_description";
  return "";
}

/** Returns the appropriate icon for a suggestion based on field type. */
function getSuggestionIcon(fieldName: string) {
  if (fieldName === "photo") return Camera;
  if (fieldName === "historyReport") return FileText;
  if (fieldName === "description" || fieldName === "descriptionBonus") return Sparkles;
  return Lightbulb;
}

/**
 * Panel displaying improvement suggestions for the visibility score.
 * Suggestions are ordered by highest boost first.
 * Clicking a suggestion scrolls to the relevant form section.
 * Tone is positive/encouraging, never punitive.
 */
export const ScoreSuggestions = memo(function ScoreSuggestions({
  suggestions,
  className,
}: ScoreSuggestionsProps) {
  // Sort suggestions by boost descending
  const sortedSuggestions = useMemo(
    () => [...suggestions].sort((a, b) => b.boost - a.boost),
    [suggestions],
  );

  const handleSuggestionClick = useCallback((fieldName: string) => {
    const sectionId = getFieldSectionId(fieldName);
    if (!sectionId) return;

    const sectionEl = document.getElementById(sectionId);
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: "smooth", block: "start" });

      // Try to focus the specific field input
      const fieldInput = document.querySelector(`[data-testid="input-${fieldName}"]`);
      if (fieldInput instanceof HTMLElement) {
        // Delay focus slightly to allow scroll to complete
        setTimeout(() => fieldInput.focus(), 400);
      }
    }
  }, []);

  if (sortedSuggestions.length === 0) {
    return (
      <div
        className={cn("rounded-lg border bg-green-50 p-4 text-center", className)}
        data-testid="score-suggestions-empty"
      >
        <Sparkles className="mx-auto h-8 w-8 text-green-500 mb-2" />
        <p className="text-sm font-medium text-green-700">
          Excellent ! Votre annonce est parfaitement documentee.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-2", className)}
      data-testid="score-suggestions"
      role="list"
      aria-label="Suggestions pour ameliorer votre score"
    >
      <h3
        className="text-sm font-semibold text-muted-foreground mb-3"
        data-testid="suggestions-title"
      >
        Ameliorez votre visibilite
      </h3>

      {sortedSuggestions.map((suggestion) => {
        const Icon = getSuggestionIcon(suggestion.field);

        return (
          <button
            key={suggestion.field}
            type="button"
            role="listitem"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-3",
              "text-left transition-colors hover:bg-accent/50",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
            onClick={() => handleSuggestionClick(suggestion.field)}
            data-testid={`suggestion-${suggestion.field}`}
            aria-label={`${suggestion.message} - plus ${suggestion.boost} points`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm leading-snug">{suggestion.message}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span
                className="text-xs font-semibold text-green-600 whitespace-nowrap"
                data-testid={`suggestion-boost-${suggestion.field}`}
              >
                +{suggestion.boost} pts
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>
        );
      })}
    </div>
  );
});
