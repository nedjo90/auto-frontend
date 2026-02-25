"use client";

import type { ISearchFilters } from "@auto/shared";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { removeFilter, countActiveFilters } from "@/lib/search-params";
import { formatPrice, formatMileage } from "@/lib/api/catalog-api";

export interface FilterChipsProps {
  filters: ISearchFilters;
  onFiltersChange: (filters: ISearchFilters) => void;
}

interface ChipData {
  key: keyof ISearchFilters;
  label: string;
  value?: string; // For array items, the specific value to remove
}

/** Build the list of active filter chips from current filters. */
function buildChips(filters: ISearchFilters): ChipData[] {
  const chips: ChipData[] = [];

  if (filters.minPrice != null && filters.maxPrice != null) {
    chips.push({
      key: "minPrice",
      label: `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`,
    });
  } else if (filters.minPrice != null) {
    chips.push({ key: "minPrice", label: `Dès ${formatPrice(filters.minPrice)}` });
  } else if (filters.maxPrice != null) {
    chips.push({ key: "maxPrice", label: `Jusqu'à ${formatPrice(filters.maxPrice)}` });
  }

  if (filters.make) {
    chips.push({ key: "make", label: `Marque: ${filters.make}` });
  }
  if (filters.model) {
    chips.push({ key: "model", label: `Modèle: ${filters.model}` });
  }

  if (filters.minYear != null && filters.maxYear != null) {
    chips.push({ key: "minYear", label: `${filters.minYear} - ${filters.maxYear}` });
  } else if (filters.minYear != null) {
    chips.push({ key: "minYear", label: `Dès ${filters.minYear}` });
  } else if (filters.maxYear != null) {
    chips.push({ key: "maxYear", label: `Jusqu'à ${filters.maxYear}` });
  }

  if (filters.maxMileage != null) {
    chips.push({ key: "maxMileage", label: `Max ${formatMileage(filters.maxMileage)}` });
  }

  filters.fuelType?.forEach((v) => {
    chips.push({ key: "fuelType", label: v, value: v });
  });
  filters.gearbox?.forEach((v) => {
    chips.push({ key: "gearbox", label: v === "manuelle" ? "Manuelle" : "Automatique", value: v });
  });
  filters.bodyType?.forEach((v) => {
    chips.push({ key: "bodyType", label: v, value: v });
  });
  filters.color?.forEach((v) => {
    chips.push({ key: "color", label: v, value: v });
  });

  // Certification level chips (Story 4-3)
  const certLabels: Record<string, string> = {
    tres_documente: "Très documenté",
    bien_documente: "Bien documenté",
    partiellement_documente: "Partiellement documenté",
  };
  filters.certificationLevel?.forEach((v) => {
    chips.push({ key: "certificationLevel", label: certLabels[v] || v, value: v });
  });

  if (filters.ctValid === true) {
    chips.push({ key: "ctValid", label: "CT valide" });
  }

  const marketLabels: Record<string, string> = {
    below: "En dessous du marché",
    aligned: "Prix aligné",
    above: "Au-dessus du marché",
  };
  if (filters.marketPosition) {
    chips.push({
      key: "marketPosition",
      label: marketLabels[filters.marketPosition] || filters.marketPosition,
    });
  }

  return chips;
}

/** Display active filter chips with removal capability. */
export function FilterChips({ filters, onFiltersChange }: FilterChipsProps) {
  const chips = buildChips(filters);
  const activeCount = countActiveFilters(filters);

  if (chips.length === 0) return null;

  const handleRemove = (chip: ChipData) => {
    let next: ISearchFilters;
    // For price range, remove both min and max when either chip is removed
    if (chip.key === "minPrice" && filters.maxPrice != null && filters.minPrice != null) {
      next = removeFilter(removeFilter(filters, "minPrice"), "maxPrice");
    } else if (chip.key === "minYear" && filters.maxYear != null && filters.minYear != null) {
      next = removeFilter(removeFilter(filters, "minYear"), "maxYear");
    } else {
      next = removeFilter(filters, chip.key, chip.value);
    }
    // Clear model when make is removed
    if (chip.key === "make") {
      next = removeFilter(next, "model");
    }
    onFiltersChange(next);
  };

  const handleClearAll = () => {
    onFiltersChange({ search: filters.search, sort: filters.sort });
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" data-testid="filter-chips">
      {chips.map((chip, i) => (
        <button
          key={`${chip.key}-${chip.value ?? i}`}
          type="button"
          onClick={() => handleRemove(chip)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          data-testid={`filter-chip-${chip.key}`}
          aria-label={`Supprimer filtre ${chip.label}`}
        >
          {chip.label}
          <X className="size-3" />
        </button>
      ))}
      {activeCount >= 2 && (
        <Button
          variant="ghost"
          size="xs"
          onClick={handleClearAll}
          data-testid="filter-clear-all-chips"
          className="text-muted-foreground"
        >
          Tout effacer
        </Button>
      )}
    </div>
  );
}
