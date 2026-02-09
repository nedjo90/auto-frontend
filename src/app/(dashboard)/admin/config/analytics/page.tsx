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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { IConfigApiProvider } from "@auto/shared";
import {
  fetchConfigEntities,
  fetchProviderAnalytics,
  type ProviderAnalytics,
} from "@/lib/api/config-api";

interface ProviderWithAnalytics {
  provider: IConfigApiProvider;
  analytics: ProviderAnalytics | null;
}

export default function AnalyticsComparisonPage() {
  const [data, setData] = useState<ProviderWithAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const providers = await fetchConfigEntities<IConfigApiProvider>("ConfigApiProviders");

      const analyticsResults = await Promise.allSettled(
        providers.map((provider) => fetchProviderAnalytics(provider.key)),
      );
      const results: ProviderWithAnalytics[] = providers.map((provider, i) => {
        const result = analyticsResults[i];
        return {
          provider,
          analytics: result.status === "fulfilled" ? result.value : null,
        };
      });
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Comparez les performances et couts des fournisseurs API.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {data.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">Aucun fournisseur API configure.</p>
      )}

      {data.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Fournisseurs actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {data.filter((d) => d.provider.status === "active").length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Appels totaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {data.reduce((sum, d) => sum + (d.analytics?.totalCalls ?? 0), 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cout total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {data.reduce((sum, d) => sum + (d.analytics?.totalCost ?? 0), 0).toFixed(2)}{" "}
                  &euro;
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Disponibilite moyenne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {data.filter((d) => d.analytics && d.analytics.totalCalls > 0).length > 0
                    ? (
                        data
                          .filter((d) => d.analytics && d.analytics.totalCalls > 0)
                          .reduce((sum, d) => sum + (d.analytics?.successRate ?? 0), 0) /
                        data.filter((d) => d.analytics && d.analytics.totalCalls > 0).length
                      ).toFixed(1)
                    : "0"}
                  %
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison table */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Comparaison des fournisseurs</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Interface</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Cout/appel</TableHead>
                  <TableHead>Temps reponse moy.</TableHead>
                  <TableHead>Taux de succes</TableHead>
                  <TableHead>Appels totaux</TableHead>
                  <TableHead>Dernier appel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map(({ provider, analytics }) => (
                  <TableRow key={provider.ID}>
                    <TableCell className="font-mono text-sm">{provider.key}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {provider.adapterInterface}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          provider.status === "active"
                            ? "default"
                            : provider.status === "inactive"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {provider.status === "active"
                          ? "Actif"
                          : provider.status === "inactive"
                            ? "Inactif"
                            : "Obsolete"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {analytics ? `${analytics.avgCostPerCall.toFixed(4)} \u20AC` : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {analytics && analytics.totalCalls > 0
                        ? `${analytics.avgResponseTimeMs} ms`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {analytics && analytics.totalCalls > 0 ? `${analytics.successRate}%` : "-"}
                    </TableCell>
                    <TableCell className="text-sm">{analytics?.totalCalls ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {analytics?.lastCallTimestamp
                        ? new Date(analytics.lastCallTimestamp).toLocaleString("fr-FR")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
