"use client";

import { useCallback, useState } from "react";
import type { ISearchFilters } from "@auto/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { countActiveFilters } from "@/lib/search-params";
import { SlidersHorizontal, X } from "lucide-react";

/** Filter options for fuel types (French market). */
const FUEL_OPTIONS = ["Essence", "Diesel", "Electrique", "Hybride", "GPL"] as const;

/** Filter options for gearbox/transmission. */
const GEARBOX_OPTIONS = [
  { value: "manuelle", label: "Manuelle" },
  { value: "automatique", label: "Automatique" },
] as const;

/** Filter options for body types. */
const BODY_TYPE_OPTIONS = [
  "Berline",
  "SUV",
  "Break",
  "Citadine",
  "Coupé",
  "Cabriolet",
  "Monospace",
  "Utilitaire",
] as const;

/** Color swatches. */
const COLOR_OPTIONS = [
  "Noir",
  "Blanc",
  "Gris",
  "Rouge",
  "Bleu",
  "Vert",
  "Jaune",
  "Orange",
  "Marron",
  "Beige",
] as const;

const CURRENT_YEAR = new Date().getFullYear();

export interface SearchFiltersProps {
  filters: ISearchFilters;
  onFiltersChange: (filters: ISearchFilters) => void;
}

/** Toggle a value in a string array. */
function toggleArrayValue(arr: string[] | undefined, value: string): string[] {
  const current = arr || [];
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

/** Multi-select chip group for filter options. */
function ChipGroup({
  options,
  selected,
  onToggle,
  testIdPrefix,
}: {
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  testIdPrefix: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const isActive = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            data-testid={`${testIdPrefix}-${opt.toLowerCase()}`}
            onClick={() => onToggle(opt)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-accent"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/** The actual filter form content (used in both mobile sheet and desktop sidebar). */
function FilterForm({ filters, onFiltersChange }: SearchFiltersProps) {
  const handleNumericChange = useCallback(
    (key: keyof ISearchFilters, value: string) => {
      const num = value === "" ? undefined : Number(value);
      onFiltersChange({ ...filters, [key]: isNaN(num as number) ? undefined : num });
    },
    [filters, onFiltersChange],
  );

  return (
    <div className="space-y-5" data-testid="search-filter-form">
      {/* Budget */}
      <div>
        <Label className="text-sm font-semibold">Budget (€)</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => handleNumericChange("minPrice", e.target.value)}
            className="h-8 text-sm"
            data-testid="filter-min-price"
            min={0}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => handleNumericChange("maxPrice", e.target.value)}
            className="h-8 text-sm"
            data-testid="filter-max-price"
            min={0}
          />
        </div>
      </div>

      {/* Make (brand) */}
      <div>
        <Label className="text-sm font-semibold">Marque</Label>
        <Input
          type="text"
          placeholder="Ex: Peugeot, Renault..."
          value={filters.make ?? ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              make: e.target.value || undefined,
              model: e.target.value ? filters.model : undefined,
            })
          }
          className="mt-1.5 h-8 text-sm"
          data-testid="filter-make"
        />
      </div>

      {/* Model (dependent on make) */}
      <div>
        <Label className="text-sm font-semibold">Modèle</Label>
        <Input
          type="text"
          placeholder={filters.make ? `Modèle ${filters.make}` : "Sélectionnez d'abord une marque"}
          value={filters.model ?? ""}
          onChange={(e) => onFiltersChange({ ...filters, model: e.target.value || undefined })}
          className="mt-1.5 h-8 text-sm"
          disabled={!filters.make}
          data-testid="filter-model"
        />
      </div>

      {/* Year range */}
      <div>
        <Label className="text-sm font-semibold">Année</Label>
        <div className="mt-1.5 flex gap-2">
          <Input
            type="number"
            placeholder="De"
            value={filters.minYear ?? ""}
            onChange={(e) => handleNumericChange("minYear", e.target.value)}
            className="h-8 text-sm"
            data-testid="filter-min-year"
            min={1900}
            max={CURRENT_YEAR + 1}
          />
          <Input
            type="number"
            placeholder="À"
            value={filters.maxYear ?? ""}
            onChange={(e) => handleNumericChange("maxYear", e.target.value)}
            className="h-8 text-sm"
            data-testid="filter-max-year"
            min={1900}
            max={CURRENT_YEAR + 1}
          />
        </div>
      </div>

      {/* Max mileage */}
      <div>
        <Label className="text-sm font-semibold">Kilométrage max (km)</Label>
        <Input
          type="number"
          placeholder="Ex: 100000"
          value={filters.maxMileage ?? ""}
          onChange={(e) => handleNumericChange("maxMileage", e.target.value)}
          className="mt-1.5 h-8 text-sm"
          data-testid="filter-max-mileage"
          min={0}
        />
      </div>

      {/* Fuel type */}
      <div>
        <Label className="text-sm font-semibold">Carburant</Label>
        <div className="mt-1.5">
          <ChipGroup
            options={FUEL_OPTIONS}
            selected={filters.fuelType || []}
            onToggle={(v) =>
              onFiltersChange({ ...filters, fuelType: toggleArrayValue(filters.fuelType, v) })
            }
            testIdPrefix="filter-fuel"
          />
        </div>
      </div>

      {/* Gearbox / Transmission */}
      <div>
        <Label className="text-sm font-semibold">Boîte de vitesses</Label>
        <div className="mt-1.5">
          <Select
            value={filters.gearbox?.[0] || "all"}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, gearbox: v === "all" ? undefined : [v] })
            }
          >
            <SelectTrigger className="h-8 w-full text-sm" data-testid="filter-gearbox">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {GEARBOX_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body type */}
      <div>
        <Label className="text-sm font-semibold">Carrosserie</Label>
        <div className="mt-1.5">
          <ChipGroup
            options={BODY_TYPE_OPTIONS}
            selected={filters.bodyType || []}
            onToggle={(v) =>
              onFiltersChange({ ...filters, bodyType: toggleArrayValue(filters.bodyType, v) })
            }
            testIdPrefix="filter-body"
          />
        </div>
      </div>

      {/* Color */}
      <div>
        <Label className="text-sm font-semibold">Couleur</Label>
        <div className="mt-1.5">
          <ChipGroup
            options={COLOR_OPTIONS}
            selected={filters.color || []}
            onToggle={(v) =>
              onFiltersChange({ ...filters, color: toggleArrayValue(filters.color, v) })
            }
            testIdPrefix="filter-color"
          />
        </div>
      </div>
    </div>
  );
}

/** Search filter panel: mobile drawer on < 768px, desktop sidebar on larger viewports. */
export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  const handleClearAll = useCallback(() => {
    onFiltersChange({ search: filters.search, sort: filters.sort });
  }, [filters.search, filters.sort, onFiltersChange]);

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            data-testid="filter-mobile-trigger"
          >
            <SlidersHorizontal className="size-4" />
            Filtres
            {activeCount > 0 && (
              <Badge variant="default" className="ml-1 h-5 min-w-5 px-1 text-[10px]">
                {activeCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
            <SheetDescription>Affinez votre recherche</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">
            <FilterForm filters={filters} onFiltersChange={onFiltersChange} />
          </div>
          <SheetFooter>
            {activeCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                data-testid="filter-clear-all-mobile"
              >
                <X className="size-3.5 mr-1" />
                Tout effacer ({activeCount})
              </Button>
            )}
            <Button size="sm" onClick={() => setOpen(false)} data-testid="filter-apply-mobile">
              Voir les résultats
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <aside className="w-64 shrink-0 space-y-4" data-testid="search-filter-sidebar">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Filtres</h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="xs" onClick={handleClearAll} data-testid="filter-clear-all">
            Tout effacer
          </Button>
        )}
      </div>
      <FilterForm filters={filters} onFiltersChange={onFiltersChange} />
    </aside>
  );
}
