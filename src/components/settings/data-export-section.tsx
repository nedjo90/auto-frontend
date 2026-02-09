"use client";

import { useState } from "react";
import { Download, FileJson, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/auth/api-client";
import type { IDataExportRequestResult, IExportDownloadResult } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const statusLabels: Record<string, string> = {
  pending: "En attente",
  processing: "En cours",
  ready: "Prêt",
  downloaded: "Téléchargé",
  expired: "Expiré",
};

export function DataExportSection() {
  const [exportReq, setExportReq] = useState<IDataExportRequestResult | null>(null);
  const [downloadResult, setDownloadResult] = useState<IExportDownloadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequestExport() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient(`${API_BASE}/api/rgpd/requestDataExport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Erreur lors de la demande d'export");
      const data: IDataExportRequestResult = await res.json();
      setExportReq(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckStatus() {
    if (!exportReq?.requestId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient(
        `${API_BASE}/api/rgpd/getExportStatus(requestId=${encodeURIComponent(exportReq.requestId)})`,
      );
      if (!res.ok) throw new Error("Erreur lors de la vérification du statut");
      const data: IDataExportRequestResult = await res.json();
      setExportReq(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!exportReq?.requestId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient(`${API_BASE}/api/rgpd/downloadExport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: exportReq.requestId }),
      });
      if (!res.ok) throw new Error("Erreur lors du téléchargement");
      const data: IExportDownloadResult = await res.json();
      setDownloadResult(data);
      setExportReq((prev) => (prev ? { ...prev, status: "downloaded" } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Exporter mes données</h2>
        <p className="text-sm text-muted-foreground">
          Téléchargez un fichier JSON contenant toutes vos données personnelles (profil,
          consentements, historique).
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {!exportReq && (
        <Button onClick={handleRequestExport} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <FileJson className="mr-2 size-4" />
          )}
          Demander l&apos;export
        </Button>
      )}

      {exportReq && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Statut :</span>
            <Badge variant={exportReq.status === "ready" ? "default" : "secondary"}>
              {statusLabels[exportReq.status] || exportReq.status}
            </Badge>
          </div>

          {exportReq.status === "pending" || exportReq.status === "processing" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Temps estimé : {exportReq.estimatedCompletionMinutes} minutes
              </p>
              <Button variant="outline" size="sm" onClick={handleCheckStatus} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 size-4" />
                )}
                Vérifier le statut
              </Button>
            </div>
          ) : null}

          {exportReq.status === "ready" && (
            <Button onClick={handleDownload} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              Télécharger mes données
            </Button>
          )}

          {downloadResult && (
            <div className="text-sm text-muted-foreground">
              <p>Taille : {Math.round((downloadResult.fileSizeBytes || 0) / 1024)} Ko</p>
              <p>
                Lien valide jusqu&apos;au :{" "}
                {new Date(downloadResult.expiresAt).toLocaleDateString("fr-FR")}
              </p>
              <a
                href={downloadResult.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Ouvrir le lien de téléchargement
              </a>
            </div>
          )}

          {exportReq.status === "downloaded" && !downloadResult && (
            <p className="text-sm text-muted-foreground">Export déjà téléchargé.</p>
          )}

          {exportReq.status === "expired" && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Le lien de téléchargement a expiré.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setExportReq(null);
                  setDownloadResult(null);
                }}
              >
                Faire une nouvelle demande
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
