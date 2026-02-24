"use client";

import { DataExportSection } from "@/components/settings/data-export-section";
import { AnonymizationSection } from "@/components/settings/anonymization-section";

export default function DataPrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-lg font-semibold sm:text-xl lg:text-2xl">Données & Vie privée</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez vos données personnelles conformément au RGPD.
        </p>
      </div>

      <DataExportSection />

      <hr className="border-border" />

      <AnonymizationSection />
    </div>
  );
}
