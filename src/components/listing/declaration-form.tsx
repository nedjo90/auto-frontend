"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { getDeclarationTemplate, type DeclarationTemplate } from "@/lib/api/declaration-api";

export interface DeclarationFormProps {
  onSubmit: (checkboxStates: Array<{ label: string; checked: boolean }>) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function DeclarationForm({
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: DeclarationFormProps) {
  const [template, setTemplate] = useState<DeclarationTemplate | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const formId = useId();

  useEffect(() => {
    let cancelled = false;
    getDeclarationTemplate()
      .then((tpl) => {
        if (!cancelled) {
          setTemplate(tpl);
          const initial: Record<number, boolean> = {};
          tpl.checkboxItems.forEach((_, i) => {
            initial[i] = false;
          });
          setCheckedItems(initial);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erreur de chargement");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalItems = template?.checkboxItems.length ?? 0;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const allChecked = totalItems > 0 && checkedCount === totalItems;

  const handleToggle = useCallback((index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const handleSubmit = useCallback(() => {
    setAttempted(true);
    if (!allChecked || !template) return;

    const states = template.checkboxItems.map((label, i) => ({
      label,
      checked: !!checkedItems[i],
    }));
    onSubmit(states);
  }, [allChecked, template, checkedItems, onSubmit]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="declaration-loading">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8" data-testid="declaration-error">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="space-y-6" data-testid="declaration-form">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-primary" />
        <h3 className="text-lg font-semibold">Déclaration sur l&apos;honneur</h3>
      </div>

      {template.introText && (
        <p className="text-sm text-muted-foreground" data-testid="declaration-intro">
          {template.introText}
        </p>
      )}

      <div className="space-y-3" role="group" aria-label="Attestations requises">
        {template.checkboxItems.map((item, index) => {
          const itemId = `${formId}-checkbox-${index}`;
          const isChecked = !!checkedItems[index];
          const showError = attempted && !isChecked;

          return (
            <div
              key={index}
              className="flex items-start gap-3"
              data-testid={`declaration-item-${index}`}
            >
              <Checkbox
                id={itemId}
                checked={isChecked}
                onCheckedChange={() => handleToggle(index)}
                disabled={disabled || isSubmitting}
                aria-invalid={showError}
                data-testid={`declaration-checkbox-${index}`}
              />
              <Label
                htmlFor={itemId}
                className={`text-sm leading-relaxed cursor-pointer ${showError ? "text-destructive" : ""}`}
              >
                {item}
              </Label>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground" data-testid="declaration-progress">
        {checkedCount}/{totalItems} attestations cochées
      </p>

      {template.legalNotice && (
        <p className="text-xs text-muted-foreground border-t pt-3" data-testid="declaration-legal">
          {template.legalNotice}
        </p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={disabled || isSubmitting || !allChecked}
        className="w-full"
        data-testid="declaration-submit-btn"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Signature en cours...
          </>
        ) : (
          "Signer et continuer"
        )}
      </Button>

      {attempted && !allChecked && (
        <p
          className="text-sm text-destructive"
          role="alert"
          data-testid="declaration-validation-error"
        >
          Veuillez cocher toutes les attestations avant de signer.
        </p>
      )}
    </div>
  );
}
