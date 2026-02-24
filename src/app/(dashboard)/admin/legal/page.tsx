"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, FileText } from "lucide-react";
import type { ILegalDocument, ILegalDocumentVersion } from "@auto/shared";
import { LEGAL_DOCUMENT_LABELS } from "@auto/shared";
import type { LegalDocumentKey } from "@auto/shared";
import { fetchConfigEntities, updateConfigEntity } from "@/lib/api/config-api";
import { getLegalAcceptanceCount } from "@/lib/api/legal-api";
import Link from "next/link";

interface DocumentWithMeta extends ILegalDocument {
  acceptanceCount: number;
  latestVersion?: ILegalDocumentVersion;
}

export default function LegalTextsPage() {
  const [documents, setDocuments] = useState<DocumentWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const docs = await fetchConfigEntities<ILegalDocument>("LegalDocuments");
      const versions = await fetchConfigEntities<ILegalDocumentVersion>("LegalDocumentVersions");

      // Enrich with acceptance counts and latest version
      const enriched: DocumentWithMeta[] = await Promise.all(
        docs.map(async (doc) => {
          let acceptanceCount = 0;
          try {
            acceptanceCount = await getLegalAcceptanceCount(doc.ID);
          } catch {
            // Acceptance count may fail if no acceptances exist
          }

          const docVersions = versions
            .filter((v) => v.document_ID === doc.ID)
            .sort((a, b) => b.version - a.version);

          return {
            ...doc,
            acceptanceCount,
            latestVersion: docVersions[0],
          };
        }),
      );

      setDocuments(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleToggleActive = async (doc: DocumentWithMeta) => {
    try {
      setSaving(true);
      setError(null);
      await updateConfigEntity("LegalDocuments", doc.ID, {
        active: !doc.active,
      });
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise a jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground" data-testid="legal-loading">
        <Loader2 className="size-4 animate-spin" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">Textes Legaux</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gerez les documents legaux avec versionnement et re-acceptation automatique.
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive" data-testid="legal-error">
          {error}
        </p>
      )}

      {documents.length === 0 && !error && (
        <p className="text-sm text-muted-foreground" data-testid="legal-empty">
          Aucun document legal configure.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {documents.map((doc) => (
          <div
            key={doc.ID}
            className="rounded-lg border bg-card p-4 shadow-sm sm:p-6"
            data-testid={`legal-card-${doc.ID}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-muted p-2">
                  <FileText className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {LEGAL_DOCUMENT_LABELS[doc.key as LegalDocumentKey] || doc.key}
                  </p>
                </div>
              </div>
              <Badge variant={doc.active ? "default" : "outline"}>
                {doc.active ? "Actif" : "Inactif"}
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-sm sm:gap-4">
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium">{doc.currentVersion}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Acceptations</p>
                <p className="font-medium">{doc.acceptanceCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Derniere MAJ</p>
                <p className="font-medium">
                  {doc.latestVersion?.publishedAt
                    ? new Date(doc.latestVersion.publishedAt).toLocaleDateString("fr-FR")
                    : "-"}
                </p>
              </div>
            </div>

            {doc.requiresReacceptance && (
              <Badge variant="destructive" className="mt-3">
                Re-acceptation requise
              </Badge>
            )}

            <div className="mt-4 flex gap-2">
              <Link href={`/admin/legal/${doc.ID}/edit`}>
                <Button variant="outline" size="sm" data-testid={`legal-edit-${doc.ID}`}>
                  <Pencil className="mr-1 size-3" />
                  Modifier
                </Button>
              </Link>
              <Button
                variant={doc.active ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggleActive(doc)}
                disabled={saving}
                data-testid={`legal-toggle-${doc.ID}`}
              >
                {doc.active ? "Desactiver" : "Activer"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
