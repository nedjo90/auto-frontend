"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save, History } from "lucide-react";
import type { ILegalDocument, ILegalDocumentVersion } from "@auto/shared";
import { LEGAL_DOCUMENT_LABELS } from "@auto/shared";
import type { LegalDocumentKey } from "@auto/shared";
import { fetchConfigEntities } from "@/lib/api/config-api";
import { publishLegalVersion } from "@/lib/api/legal-api";
import { Checkbox } from "@/components/ui/checkbox";

export default function LegalDocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const [document, setDocument] = useState<ILegalDocument | null>(null);
  const [versions, setVersions] = useState<ILegalDocumentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editor state
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [requiresReacceptance, setRequiresReacceptance] = useState(true);

  // Version history sidebar
  const [selectedVersion, setSelectedVersion] = useState<ILegalDocumentVersion | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const docs = await fetchConfigEntities<ILegalDocument>("LegalDocuments");
      const doc = docs.find((d) => d.ID === documentId);
      if (!doc) {
        setError("Document non trouve");
        return;
      }
      setDocument(doc);

      const allVersions = await fetchConfigEntities<ILegalDocumentVersion>("LegalDocumentVersions");
      const docVersions = allVersions
        .filter((v) => v.document_ID === documentId)
        .sort((a, b) => b.version - a.version);
      setVersions(docVersions);

      // Load current version content into editor
      const currentVersion = docVersions.find((v) => !v.archived);
      if (currentVersion) {
        setContent(currentVersion.content);
        setSelectedVersion(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handlePublish = async () => {
    if (!content.trim()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await publishLegalVersion(documentId, content, summary, requiresReacceptance);

      setSuccess("Nouvelle version publiee avec succes.");
      setSummary("");
      await loadDocument();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la publication");
    } finally {
      setSaving(false);
    }
  };

  const handleViewVersion = (version: ILegalDocumentVersion) => {
    setSelectedVersion(version);
  };

  const handleBackToCurrentVersion = () => {
    setSelectedVersion(null);
    const current = versions.find((v) => !v.archived);
    if (current) {
      setContent(current.content);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 text-muted-foreground"
        data-testid="legal-edit-loading"
      >
        <Loader2 className="size-4 animate-spin" />
        Chargement...
      </div>
    );
  }

  if (!document) {
    return (
      <div className="space-y-4">
        <p className="text-destructive" data-testid="legal-edit-not-found">
          Document non trouve.
        </p>
        <Button variant="outline" onClick={() => router.push("/admin/legal")}>
          <ArrowLeft className="mr-2 size-4" />
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/legal")}>
            <ArrowLeft className="mr-1 size-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{document.title}</h1>
            <p className="text-sm text-muted-foreground">
              {LEGAL_DOCUMENT_LABELS[document.key as LegalDocumentKey] || document.key}
              {" — "}Version actuelle: {document.currentVersion}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          data-testid="toggle-history-btn"
        >
          <History className="mr-1 size-4" />
          {showHistory ? "Masquer l'historique" : "Historique"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive" data-testid="legal-edit-error">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-600" data-testid="legal-edit-success">
          {success}
        </p>
      )}

      <div className="flex gap-6">
        {/* Main editor area */}
        <div className="flex-1 space-y-4">
          {selectedVersion ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Version {selectedVersion.version}</Badge>
                {selectedVersion.archived && <Badge variant="secondary">Archivee</Badge>}
                <Button variant="ghost" size="sm" onClick={handleBackToCurrentVersion}>
                  Revenir a la version actuelle
                </Button>
              </div>
              <div
                className="min-h-[400px] rounded-md border bg-muted/30 p-4 text-sm whitespace-pre-wrap"
                data-testid="version-content-preview"
              >
                {selectedVersion.content}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <Label htmlFor="legal-content">Contenu du document</Label>
                <textarea
                  id="legal-content"
                  className="min-h-[400px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Entrez le contenu du document legal..."
                  data-testid="legal-content-textarea"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="legal-summary">Resume des modifications</Label>
                <Input
                  id="legal-summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Decrivez les modifications apportees..."
                  data-testid="legal-summary-input"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="legal-reacceptance"
                  checked={requiresReacceptance}
                  onCheckedChange={(checked) => setRequiresReacceptance(checked === true)}
                  data-testid="legal-reacceptance-checkbox"
                />
                <Label htmlFor="legal-reacceptance" className="text-sm">
                  Exiger la re-acceptation par les utilisateurs
                </Label>
              </div>

              <Button
                onClick={handlePublish}
                disabled={saving || !content.trim()}
                data-testid="legal-publish-btn"
              >
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                <Save className="mr-2 size-4" />
                Publier une nouvelle version
              </Button>
            </>
          )}
        </div>

        {/* Version history sidebar */}
        {showHistory && (
          <div className="w-72 shrink-0 space-y-2" data-testid="version-history-sidebar">
            <h3 className="text-sm font-semibold">Historique des versions</h3>
            {versions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune version.</p>
            ) : (
              <div className="space-y-1">
                {versions.map((v) => (
                  <button
                    key={v.ID}
                    onClick={() => handleViewVersion(v)}
                    className={`w-full rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted/50 ${
                      selectedVersion?.ID === v.ID ? "border-primary bg-muted/50" : ""
                    }`}
                    data-testid={`version-item-${v.version}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">v{v.version}</span>
                      {!v.archived && (
                        <Badge variant="default" className="text-xs">
                          Actuelle
                        </Badge>
                      )}
                      {v.archived && (
                        <Badge variant="outline" className="text-xs">
                          Archivee
                        </Badge>
                      )}
                    </div>
                    {v.summary && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{v.summary}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {v.publishedAt ? new Date(v.publishedAt).toLocaleDateString("fr-FR") : "-"}
                      {v.publishedBy && ` par ${v.publishedBy}`}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
