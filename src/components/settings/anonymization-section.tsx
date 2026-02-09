"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANONYMIZATION_FIELDS } from "@auto/shared";
import { AnonymizationConfirmationDialog } from "./anonymization-confirmation-dialog";

export function AnonymizationSection() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-destructive">Anonymiser mon compte</h2>
        <p className="text-sm text-muted-foreground">
          Cette action est irréversible. Vos données personnelles seront remplacées par des valeurs
          anonymisées.
        </p>
      </div>

      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="space-y-2">
            <p className="text-sm font-medium">Données qui seront anonymisées :</p>
            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-0.5">
              {ANONYMIZATION_FIELDS.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
            <p className="text-sm font-medium">Données qui seront préservées :</p>
            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-0.5">
              <li>Annonces publiées (avec vendeur anonymisé)</li>
              <li>Historique des consentements</li>
              <li>Journaux d&apos;audit</li>
            </ul>
          </div>
        </div>

        <Button variant="destructive" onClick={() => setDialogOpen(true)}>
          <AlertTriangle className="mr-2 size-4" />
          Anonymiser mon compte
        </Button>
      </div>

      <AnonymizationConfirmationDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
