"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CertifiedFieldResult } from "@auto/shared";

export interface CertifiedFieldProps {
  field: CertifiedFieldResult;
  index: number;
  reducedMotion?: boolean;
}

/**
 * Displays a single auto-filled field with a Certified badge.
 * Supports progressive stagger animation (100ms per field) unless reducedMotion is set.
 */
export function CertifiedField({ field, index, reducedMotion = false }: CertifiedFieldProps) {
  const formattedDate = formatTimestamp(field.sourceTimestamp);

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-md border px-3 py-2",
        !reducedMotion && "animate-in fade-in slide-in-from-left-2",
      )}
      style={
        !reducedMotion
          ? { animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }
          : undefined
      }
      data-testid={`certified-field-${field.fieldName}`}
    >
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground" data-testid="field-label">
          {formatFieldLabel(field.fieldName)}
        </span>
        <span className="font-medium" data-testid="field-value">
          {field.fieldValue}
        </span>
      </div>

      {field.isCertified && (
        <Badge
          variant="default"
          className="bg-green-600 text-white text-xs"
          aria-label={`Certifie par ${field.source}, le ${formattedDate}`}
          data-testid="certified-badge"
        >
          Certifie {field.source} - {formattedDate}
        </Badge>
      )}
    </div>
  );
}

/** Map camelCase field names to human-readable French labels. */
const FIELD_LABELS: Record<string, string> = {
  plate: "Plaque",
  vin: "VIN",
  make: "Marque",
  model: "Modele",
  variant: "Variante",
  year: "Annee",
  registrationDate: "Date de mise en circulation",
  fuelType: "Carburant",
  engineCapacityCc: "Cylindree (cc)",
  powerKw: "Puissance (kW)",
  powerHp: "Puissance (ch)",
  gearbox: "Boite de vitesses",
  bodyType: "Carrosserie",
  doors: "Portes",
  seats: "Places",
  color: "Couleur",
  co2GKm: "CO2 (g/km)",
  euroNorm: "Norme Euro",
  energyClass: "Classe energetique",
  recallCount: "Rappels",
  critAirLevel: "Vignette Crit'Air",
  critAirLabel: "Label Crit'Air",
  critAirColor: "Couleur Crit'Air",
  bodyClass: "Type de carrosserie",
  driveType: "Transmission",
  engineCylinders: "Cylindres",
  manufacturer: "Constructeur",
  vehicleType: "Type de vehicule",
  plantCountry: "Pays de fabrication",
};

function formatFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] || fieldName;
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return timestamp;
  }
}
