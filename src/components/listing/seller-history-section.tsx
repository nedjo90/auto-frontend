"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchSellerHistoryReport, type FetchHistoryReportResult } from "@/lib/api/history-api";

export interface SellerHistorySectionProps {
  listingId: string;
  /** Pre-existing report if already fetched */
  existingReport?: {
    fetchedAt: string;
    source: string;
    ownerCount: number;
    accidentCount: number;
    stolen: boolean;
    outstandingFinance: boolean;
  } | null;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function SellerHistorySection({ listingId, existingReport }: SellerHistorySectionProps) {
  const [report, setReport] = useState(existingReport ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result: FetchHistoryReportResult = await fetchSellerHistoryReport(listingId);
      setReport({
        fetchedAt: result.fetchedAt,
        source: result.source,
        ownerCount: result.reportData.ownerCount,
        accidentCount: result.reportData.totalDamageCount,
        stolen: result.reportData.stolen,
        outstandingFinance: result.reportData.outstandingFinance,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la génération du rapport");
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  return (
    <Card data-testid="seller-history-section">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Rapport historique</CardTitle>
      </CardHeader>
      <CardContent>
        {report ? (
          <div className="space-y-3" data-testid="report-summary">
            <p className="text-sm text-muted-foreground" data-testid="report-generated-date">
              Rapport généré le {formatDate(report.fetchedAt)}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Propriétaires : </span>
                <span className="font-medium" data-testid="summary-owners">{report.ownerCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sinistres : </span>
                <span className="font-medium" data-testid="summary-accidents">{report.accidentCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Vol : </span>
                <Badge
                  variant={report.stolen ? "destructive" : "secondary"}
                  className="text-xs"
                  data-testid="summary-stolen"
                >
                  {report.stolen ? "Signalé" : "Non signalé"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Gage : </span>
                <Badge
                  variant={report.outstandingFinance ? "destructive" : "secondary"}
                  className="text-xs"
                  data-testid="summary-finance"
                >
                  {report.outstandingFinance ? "En cours" : "Aucun"}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Source : {report.source}
            </p>
          </div>
        ) : (
          <div className="space-y-3" data-testid="report-not-fetched">
            <p className="text-sm text-muted-foreground">
              Le rapport sera généré lors de la publication
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchReport}
              disabled={isLoading}
              data-testid="fetch-report-btn"
            >
              {isLoading ? "Génération en cours…" : "Générer le rapport maintenant"}
            </Button>
            {error && (
              <p className="text-sm text-destructive" data-testid="fetch-error">
                {error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
