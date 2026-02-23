"use client";

import { useId, useState, useCallback, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ListingFieldMeta, ListingFieldState, FieldStatus } from "@auto/shared";
import { validateListingField, LISTING_CONDITIONS, LISTING_VALIDATION } from "@auto/shared";

export interface ListingFormFieldProps {
  fieldMeta: ListingFieldMeta;
  fieldState?: ListingFieldState;
  onFieldChange: (fieldName: string, value: string) => void;
  onCertifiedOverride: (fieldName: string) => void;
  disabled?: boolean;
}

/**
 * A single field in the listing form.
 * Renders certified (green), declared (yellow), or empty (grey) state.
 */
export const ListingFormField = memo(function ListingFormField({
  fieldMeta,
  fieldState,
  onFieldChange,
  onCertifiedOverride,
  disabled = false,
}: ListingFormFieldProps) {
  const inputId = useId();
  const errorId = useId();
  const [error, setError] = useState<string | null>(null);

  const status: FieldStatus = fieldState?.status || "empty";
  const value = fieldState?.value ?? "";

  const handleChange = useCallback(
    (newValue: string) => {
      const validationError = validateListingField(fieldMeta.fieldName, newValue);
      setError(validationError);
      onFieldChange(fieldMeta.fieldName, newValue);
    },
    [fieldMeta.fieldName, onFieldChange],
  );

  const isCertified = status === "certified";

  return (
    <div
      className={cn(
        "space-y-1.5",
        fieldMeta.fieldName === "description" && "sm:col-span-2",
        fieldMeta.fieldName === "options" && "sm:col-span-2",
      )}
      data-testid={`form-field-${fieldMeta.fieldName}`}
    >
      <div className="flex items-center gap-2">
        <Label htmlFor={inputId}>
          {fieldMeta.labelFr}
          {fieldMeta.required && (
            <span className="text-destructive ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </Label>
        <FieldStatusBadge status={status} certifiedSource={fieldState?.certifiedSource} />
      </div>

      {isCertified ? (
        <div className="flex items-center gap-2">
          <Input
            id={inputId}
            value={String(value)}
            readOnly
            aria-readonly="true"
            tabIndex={0}
            className="bg-green-50 border-green-300 cursor-default"
            aria-describedby={error ? errorId : undefined}
            data-testid={`input-${fieldMeta.fieldName}`}
          />
          <button
            type="button"
            onClick={() => onCertifiedOverride(fieldMeta.fieldName)}
            className="text-sm text-primary hover:underline whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded px-2 py-1"
            disabled={disabled}
            data-testid={`override-btn-${fieldMeta.fieldName}`}
          >
            Modifier
          </button>
        </div>
      ) : fieldMeta.fieldName === "condition" ? (
        <select
          id={inputId}
          value={String(value)}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none md:text-sm"
          aria-describedby={error ? errorId : undefined}
          aria-required={fieldMeta.required}
          aria-invalid={!!error}
          data-testid={`input-${fieldMeta.fieldName}`}
        >
          <option value="">-- Sélectionner --</option>
          {LISTING_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c === "A_restaurer" ? "À restaurer" : c}
            </option>
          ))}
        </select>
      ) : fieldMeta.fieldName === "transmission" ? (
        <select
          id={inputId}
          value={String(value)}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none md:text-sm"
          aria-describedby={error ? errorId : undefined}
          aria-required={fieldMeta.required}
          aria-invalid={!!error}
          data-testid={`input-${fieldMeta.fieldName}`}
        >
          <option value="">-- Sélectionner --</option>
          {LISTING_VALIDATION.transmission.values.map((v) => (
            <option key={v} value={v}>
              {v === "manuelle" ? "Manuelle" : "Automatique"}
            </option>
          ))}
        </select>
      ) : fieldMeta.fieldName === "driveType" ? (
        <select
          id={inputId}
          value={String(value)}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none md:text-sm"
          aria-describedby={error ? errorId : undefined}
          aria-required={fieldMeta.required}
          aria-invalid={!!error}
          data-testid={`input-${fieldMeta.fieldName}`}
        >
          <option value="">-- Sélectionner --</option>
          {LISTING_VALIDATION.driveType.values.map((v) => (
            <option key={v} value={v}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </option>
          ))}
        </select>
      ) : fieldMeta.fieldName === "description" ? (
        <textarea
          id={inputId}
          value={String(value)}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          rows={4}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none md:text-sm resize-y"
          aria-describedby={error ? errorId : undefined}
          aria-required={fieldMeta.required}
          aria-invalid={!!error}
          placeholder="Décrivez votre véhicule..."
          data-testid={`input-${fieldMeta.fieldName}`}
        />
      ) : (
        <Input
          id={inputId}
          type={isNumericField(fieldMeta.fieldName) ? "number" : "text"}
          value={String(value)}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          aria-describedby={error ? errorId : undefined}
          aria-required={fieldMeta.required}
          aria-invalid={!!error}
          data-testid={`input-${fieldMeta.fieldName}`}
        />
      )}

      {fieldState?.originalCertifiedValue && (
        <p
          className="text-xs text-muted-foreground"
          data-testid={`original-value-${fieldMeta.fieldName}`}
        >
          Valeur certifiée: {fieldState.originalCertifiedValue}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-xs text-destructive"
          role="alert"
          data-testid={`error-${fieldMeta.fieldName}`}
        >
          {error}
        </p>
      )}
    </div>
  );
});

function FieldStatusBadge({
  status,
  certifiedSource,
}: {
  status: FieldStatus;
  certifiedSource?: string;
}) {
  switch (status) {
    case "certified":
      return (
        <Badge
          className="bg-green-600 text-white text-xs"
          aria-label={`Certifié par ${certifiedSource || "source"}`}
          data-testid="badge-certified"
        >
          Certifié
        </Badge>
      );
    case "declared":
      return (
        <Badge
          className="bg-yellow-500 text-black text-xs"
          aria-label="Déclaré par le vendeur"
          data-testid="badge-declared"
        >
          Déclaré vendeur
        </Badge>
      );
    case "empty":
      return (
        <Badge
          variant="outline"
          className="text-xs"
          aria-label="À compléter"
          data-testid="badge-empty"
        >
          À compléter
        </Badge>
      );
  }
}

// Numeric field names — corresponds to Integer/Decimal fields in CDS schema
const NUMERIC_FIELD_NAMES = new Set([
  "price",
  "mileage",
  "year",
  "engineCapacityCc",
  "powerKw",
  "powerHp",
  "doors",
  "seats",
  "co2GKm",
  "numberOfDoors",
  "engineCylinders",
  "recallCount",
]);

function isNumericField(fieldName: string): boolean {
  return NUMERIC_FIELD_NAMES.has(fieldName);
}
