"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchApiCostSummary, type ApiCostSummary } from "@/lib/api/config-api";

const PERIODS = [
  { value: "day", label: "Dernieres 24h" },
  { value: "week", label: "7 derniers jours" },
  { value: "month", label: "30 derniers jours" },
] as const;

/** Revenue per listing (fixed at 15 EUR per business rule). */
const REVENUE_PER_LISTING = 15;

interface ByProviderEntry {
  providerKey: string;
  totalCost: number;
  callCount: number;
}

export default function CostTrackingPage() {
  const [summary, setSummary] = useState<ApiCostSummary | null>(null);
  const [byProvider, setByProvider] = useState<ByProviderEntry[]>([]);
  const [period, setPeriod] = useState<string>("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApiCostSummary(period);
      setSummary(data);
      try {
        setByProvider(JSON.parse(data.byProvider || "[]"));
      } catch {
        setByProvider([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const margin = summary ? REVENUE_PER_LISTING - summary.avgCostPerCall : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">Suivi des couts API et marge par annonce.</p>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.value)}
              disabled={loading}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Chargement...
        </div>
      )}

      {!loading && summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cout total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.totalCost.toFixed(2)} &euro;</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nombre d&apos;appels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.callCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cout moyen / appel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.avgCostPerCall.toFixed(4)} &euro;</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Marge / annonce
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {margin !== null ? `${margin.toFixed(2)} \u20AC` : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {REVENUE_PER_LISTING} &euro; revenu - cout API
                </p>
              </CardContent>
            </Card>
          </div>

          {byProvider.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Repartition par fournisseur</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Appels</TableHead>
                    <TableHead>Cout total</TableHead>
                    <TableHead>Cout moyen / appel</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byProvider.map((entry) => (
                    <TableRow key={entry.providerKey}>
                      <TableCell className="font-mono text-sm">{entry.providerKey}</TableCell>
                      <TableCell>{entry.callCount}</TableCell>
                      <TableCell>{entry.totalCost.toFixed(4)} &euro;</TableCell>
                      <TableCell>
                        {entry.callCount > 0
                          ? (entry.totalCost / entry.callCount).toFixed(4)
                          : "0.0000"}{" "}
                        &euro;
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {byProvider.length === 0 && summary.callCount === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun appel API enregistre pour cette periode.
            </p>
          )}
        </>
      )}
    </div>
  );
}
