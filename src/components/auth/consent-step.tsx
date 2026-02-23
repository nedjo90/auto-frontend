"use client";

import { useState } from "react";
import type { IConfigConsentType } from "@auto/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface ConsentDecisions {
  [consentTypeId: string]: boolean;
}

interface ConsentStepProps {
  consentTypes: IConfigConsentType[];
  value: ConsentDecisions;
  onChange: (decisions: ConsentDecisions) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function ConsentStep({ consentTypes, value, onChange, errors, disabled }: ConsentStepProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleConsent = (consentTypeId: string, checked: boolean) => {
    onChange({ ...value, [consentTypeId]: checked });
  };

  const toggleDescription = (consentTypeId: string) => {
    setExpanded((prev) => ({ ...prev, [consentTypeId]: !prev[consentTypeId] }));
  };

  if (consentTypes.length === 0) return null;

  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="text-sm font-medium">Consentements</legend>
      {consentTypes.map((ct) => {
        const errorId = `consent-${ct.ID}-error`;
        const descId = `consent-${ct.ID}-desc`;
        const error = errors?.[ct.ID];
        const isChecked = value[ct.ID] ?? false;

        return (
          <div key={ct.ID} className="space-y-1">
            <div className="flex items-start gap-2">
              <Checkbox
                id={`consent-${ct.ID}`}
                checked={isChecked}
                onCheckedChange={(checked) => toggleConsent(ct.ID, checked === true)}
                aria-required={ct.isMandatory}
                aria-invalid={!!error}
                aria-describedby={
                  [error ? errorId : null, expanded[ct.ID] ? descId : null]
                    .filter(Boolean)
                    .join(" ") || undefined
                }
                disabled={disabled}
              />
              <div className="flex-1">
                <Label
                  htmlFor={`consent-${ct.ID}`}
                  className="cursor-pointer font-normal leading-snug"
                >
                  {ct.labelKey}
                  {ct.isMandatory ? (
                    <span className="text-destructive" aria-hidden="true">
                      {" "}
                      *
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs"> (optionnel)</span>
                  )}
                </Label>
                <button
                  type="button"
                  className="mt-0.5 block text-xs text-muted-foreground underline"
                  onClick={() => toggleDescription(ct.ID)}
                  aria-expanded={expanded[ct.ID] ?? false}
                  aria-controls={descId}
                >
                  {expanded[ct.ID] ? "Masquer les détails" : "Voir les détails"}
                </button>
                {expanded[ct.ID] && (
                  <p id={descId} className="mt-1 text-xs text-muted-foreground">
                    {ct.descriptionKey}
                  </p>
                )}
              </div>
            </div>
            {error && (
              <p id={errorId} className="ml-6 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
