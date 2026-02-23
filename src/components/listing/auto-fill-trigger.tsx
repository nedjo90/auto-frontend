"use client";

import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IdentifierType } from "@auto/shared";

const PLATE_REGEX = /^[A-Z]{2}-?\d{3}-?[A-Z]{2}$/;
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;
const PLATE_PARTIAL_REGEX = /^[A-Z]{0,2}-?\d{0,3}-?[A-Z]{0,2}$/;

export type DetectedFormat = "plate" | "vin" | "unknown";

export interface AutoFillTriggerProps {
  onSearch: (identifier: string, identifierType: IdentifierType) => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Detect whether the input looks like a license plate or VIN.
 * Detection triggers at 3+ characters.
 *
 * French plates are exactly 7 alphanumeric: AA-NNN-AA.
 * VINs are exactly 17 alphanumeric (no I, O, Q).
 * If the clean input exceeds 7 alphanumeric chars, it must be VIN.
 */
export function detectFormat(value: string): DetectedFormat {
  const upper = value.toUpperCase().replace(/\s/g, "");
  if (upper.length < 3) return "unknown";

  // Strip dashes/spaces for pure alphanumeric analysis
  const clean = upper.replace(/[^A-Z0-9]/g, "");

  // If >7 alphanumeric chars, it's too long for a plate → VIN candidate
  if (clean.length > 7 && /^[A-HJ-NPR-Z0-9]+$/.test(clean)) {
    return "vin";
  }

  // At 7 or fewer chars, prioritize plate detection
  // Check plate pattern (with or without dashes)
  if (PLATE_PARTIAL_REGEX.test(upper) && /[A-Z]/.test(upper) && /\d/.test(upper)) {
    return "plate";
  }

  // Only consider VIN if input exceeds plate max length (7 alphanumeric)
  if (clean.length > 7 && /^[A-HJ-NPR-Z0-9]+$/.test(clean)) {
    return "vin";
  }

  return "unknown";
}

/**
 * Auto-format plate input with dashes: AB123CD -> AB-123-CD
 */
export function formatPlate(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return clean.slice(0, 2) + "-" + clean.slice(2);
  return clean.slice(0, 2) + "-" + clean.slice(2, 5) + "-" + clean.slice(5, 7);
}

/**
 * Check if identifier is a fully valid plate or VIN.
 */
export function isValidIdentifier(value: string, format: DetectedFormat): boolean {
  const upper = value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  if (format === "plate") return PLATE_REGEX.test(upper);
  if (format === "vin") return VIN_REGEX.test(upper);
  return false;
}

export function AutoFillTrigger({
  onSearch,
  loading = false,
  disabled = false,
}: AutoFillTriggerProps) {
  const [inputValue, setInputValue] = useState("");
  const [detectedFormat, setDetectedFormat] = useState<DetectedFormat>("unknown");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    const format = detectFormat(value);
    setDetectedFormat(format);

    if (format === "plate") {
      value = formatPlate(value);
    }

    setInputValue(value);
  }, []);

  const handleSearch = useCallback(() => {
    if (!isValidIdentifier(inputValue, detectedFormat)) return;
    const identifierType: IdentifierType = detectedFormat === "plate" ? "plate" : "vin";
    onSearch(inputValue, identifierType);
  }, [inputValue, detectedFormat, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  const isValid = isValidIdentifier(inputValue, detectedFormat);

  const labelText =
    detectedFormat === "plate"
      ? "Plaque d\u00e9tect\u00e9e"
      : detectedFormat === "vin"
        ? "VIN d\u00e9tect\u00e9"
        : "Identifiez votre v\u00e9hicule";

  return (
    <div className="w-full max-w-lg space-y-2" data-testid="auto-fill-trigger">
      <label
        htmlFor="vehicle-identifier"
        aria-live="polite"
        className={cn(
          "block text-sm font-medium",
          detectedFormat !== "unknown" ? "text-green-600 dark:text-green-400" : "text-foreground",
        )}
        data-testid="auto-fill-label"
      >
        {labelText}
      </label>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id="vehicle-identifier"
          placeholder="AA-123-BB ou numero VIN"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={loading || disabled}
          maxLength={20}
          className="flex-1 text-lg font-mono tracking-wider"
          data-testid="auto-fill-input"
          aria-label="Identifiant du véhicule"
        />

        <Button
          onClick={handleSearch}
          disabled={!isValid || loading || disabled}
          size="lg"
          data-testid="auto-fill-search-button"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
              Recherche en cours...
            </>
          ) : (
            <>
              <Search className="size-4" />
              Rechercher
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground" data-testid="auto-fill-help">
        Entrez votre plaque d&apos;immatriculation ou votre numero VIN pour remplir automatiquement
        les données de votre véhicule.
      </p>
    </div>
  );
}
