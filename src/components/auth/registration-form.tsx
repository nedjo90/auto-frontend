"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { IConfigRegistrationField, IConfigConsentType } from "@auto/shared";
import { buildRegistrationSchema } from "@auto/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { msalInstance, msalInitPromise } from "@/lib/auth/msal-instance";
import { loginRequest } from "@/lib/auth/msal-config";
import { ConsentStep, type ConsentDecisions } from "./consent-step";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface ServerError {
  field?: string;
  message: string;
}

async function fetchRegistrationFields(): Promise<IConfigRegistrationField[]> {
  const res = await fetch(
    `${API_BASE}/api/registration/ConfigRegistrationFields?$orderby=displayOrder asc`,
  );
  if (!res.ok) throw new Error("Failed to load registration fields");
  const data = await res.json();
  return data.value;
}

async function submitRegistration(
  values: Record<string, unknown>,
): Promise<{ success: boolean; userId: string; email: string; redirectUrl: string }> {
  const res = await fetch(`${API_BASE}/api/registration/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: values }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(error.error?.message || "Registration failed");
  }
  return res.json();
}

export function RegistrationForm() {
  const [fields, setFields] = useState<IConfigRegistrationField[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [consentDecisions, setConsentDecisions] = useState<ConsentDecisions>({});
  const [consentErrors, setConsentErrors] = useState<Record<string, string>>({});
  const [consentTypes, setConsentTypes] = useState<IConfigConsentType[]>([]);

  const schema = fields.length > 0 ? buildRegistrationSchema(fields) : z.object({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FieldValues>({
    resolver: zodResolver(schema) as any,
    mode: "onBlur",
  });

  useEffect(() => {
    Promise.all([
      fetchRegistrationFields(),
      fetch(`${API_BASE}/api/consent/ActiveConsentTypes?$orderby=displayOrder asc`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load consent types");
          return res.json();
        })
        .then((data) => data.value as IConfigConsentType[]),
    ])
      .then(([regFields, ctypes]) => {
        setFields(regFields);
        setConsentTypes(ctypes);
      })
      .catch(() => setServerError({ message: "Impossible de charger le formulaire" }))
      .finally(() => setLoading(false));
  }, []);

  const focusFirstError = useCallback(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstErrorField = errorKeys[0];
      fieldRefs.current[firstErrorField]?.focus();
    }
  }, [errors]);

  useEffect(() => {
    focusFirstError();
  }, [errors, focusFirstError]);

  const validateConsents = (): boolean => {
    const errors: Record<string, string> = {};
    for (const ct of consentTypes) {
      if (ct.isMandatory && !consentDecisions[ct.ID]) {
        errors[ct.ID] = "Ce consentement est requis";
      }
    }
    setConsentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!validateConsents()) return;

    setServerError(null);
    setSubmitting(true);
    try {
      const result = await submitRegistration(data);
      if (result.success) {
        // Record consent decisions (RGPD: must confirm before proceeding)
        const consents = consentTypes.map((ct) => ({
          consentTypeId: ct.ID,
          decision: consentDecisions[ct.ID] ? "granted" : "revoked",
        }));
        const consentRes = await fetch(`${API_BASE}/api/consent/recordConsents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: { consents } }),
        });
        if (!consentRes.ok) {
          throw new Error("Échec de l'enregistrement des consentements");
        }
        // Ensure MSAL is initialized before redirect
        await msalInitPromise;
        await msalInstance.loginRedirect(loginRequest);
      }
    } catch (err) {
      setServerError({
        message: err instanceof Error ? err.message : "Une erreur est survenue",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8" role="status">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Chargement du formulaire...</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4"
    >
      {/* Dynamic config-driven fields */}
      {fields.map((field) => {
        const errorId = `${field.fieldName}-error`;
        const error = errors[field.fieldName];

        return (
          <div key={field.ID} className="space-y-1.5">
            <Label htmlFor={field.fieldName}>
              {field.labelKey}
              {field.isRequired ? (
                <span className="text-destructive" aria-hidden="true"> *</span>
              ) : (
                <span className="text-muted-foreground text-xs"> (optionnel)</span>
              )}
            </Label>
            <Input
              id={field.fieldName}
              type={field.fieldType === "email" ? "email" : field.fieldType === "tel" ? "tel" : "text"}
              placeholder={field.placeholderKey}
              aria-required={field.isRequired}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              disabled={submitting}
              {...register(field.fieldName, {
                setValueAs: (v: string) => v || undefined,
              })}
              ref={(el) => {
                fieldRefs.current[field.fieldName] = el;
                const { ref } = register(field.fieldName);
                if (typeof ref === "function") ref(el);
              }}
            />
            {error && (
              <p id={errorId} className="text-sm text-destructive" role="alert">
                {String(error.message)}
              </p>
            )}
          </div>
        );
      })}

      {/* Password field (always present) */}
      <div className="space-y-1.5">
        <Label htmlFor="password">
          Mot de passe
          <span className="text-destructive" aria-hidden="true"> *</span>
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimum 8 caractères"
          aria-required={true}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          disabled={submitting}
          {...register("password")}
          ref={(el) => {
            fieldRefs.current.password = el;
            const { ref } = register("password");
            if (typeof ref === "function") ref(el);
          }}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive" role="alert">
            {String(errors.password.message)}
          </p>
        )}
      </div>

      {/* Config-driven consent checkboxes (RGPD) */}
      <div className="pt-2">
        <ConsentStep
          consentTypes={consentTypes}
          value={consentDecisions}
          onChange={setConsentDecisions}
          errors={consentErrors}
          disabled={submitting}
        />
      </div>

      {/* Server error */}
      {serverError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {serverError.message}
        </div>
      )}

      {/* Submit button */}
      <Button
        type="submit"
        className="w-full"
        disabled={submitting || fields.length === 0}
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Inscription en cours...
          </>
        ) : (
          "Créer mon compte"
        )}
      </Button>
    </form>
  );
}
