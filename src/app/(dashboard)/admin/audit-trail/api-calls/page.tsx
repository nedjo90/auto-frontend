"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Download, ChevronLeft, ChevronRight, ArrowUpDown, ArrowLeft } from "lucide-react";
import {
  fetchApiCallLogs,
  exportApiCallLogsCsv,
  type ApiCallLogFilters,
} from "@/lib/api/audit-api";
import type { IApiCallLog } from "@auto/shared";
import Link from "next/link";

const PAGE_SIZES = [25, 50, 100];

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300)
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (status >= 400 && status < 500)
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  if (status >= 500) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return "bg-gray-100 text-gray-800";
}

export default function ApiCallLogPage() {
  const [entries, setEntries] = useState<IApiCallLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Sorting
  const [orderBy, setOrderBy] = useState("timestamp desc");

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [adapterFilter, setAdapterFilter] = useState("");
  const [listingIdFilter, setListingIdFilter] = useState("");

  const buildFilters = useCallback((): ApiCallLogFilters => {
    const filters: ApiCallLogFilters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (providerFilter) filters.provider = providerFilter;
    if (adapterFilter) filters.adapter = adapterFilter;
    if (listingIdFilter) filters.listingId = listingIdFilter;
    return filters;
  }, [dateFrom, dateTo, providerFilter, adapterFilter, listingIdFilter]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchApiCallLogs(buildFilters(), orderBy, pageSize, page * pageSize);
      setEntries(result.entries);
      setTotalCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [buildFilters, orderBy, pageSize, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const csv = await exportApiCallLogsCsv(buildFilters());
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `api-call-logs-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'export");
    } finally {
      setExporting(false);
    }
  };

  const handleSort = (column: string) => {
    setOrderBy((prev) => {
      const [currentCol, currentDir] = prev.split(" ");
      if (currentCol === column) {
        return `${column} ${currentDir === "desc" ? "asc" : "desc"}`;
      }
      return `${column} desc`;
    });
    setPage(0);
  };

  const handleApplyFilters = () => {
    setPage(0);
  };

  const handleResetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setProviderFilter("");
    setAdapterFilter("");
    setListingIdFilter("");
    setPage(0);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6" data-testid="api-call-log-page">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/audit-trail">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 size-4" /> Piste d&apos;audit
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Journal des appels API</h1>
            <p className="text-sm text-muted-foreground">
              Suivi des appels aux fournisseurs API externes
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
          data-testid="export-csv-btn"
        >
          {exporting ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Download className="mr-2 size-4" />
          )}
          Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <div
        className="grid grid-cols-2 gap-4 rounded-md border p-4 sm:grid-cols-3 lg:grid-cols-4"
        data-testid="api-log-filters"
      >
        <div>
          <label className="text-xs font-medium text-muted-foreground">Date debut</label>
          <Input
            type="datetime-local"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            data-testid="filter-date-from"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Date fin</label>
          <Input
            type="datetime-local"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            data-testid="filter-date-to"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Fournisseur</label>
          <Input
            placeholder="Cle fournisseur..."
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            data-testid="filter-provider"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Adaptateur</label>
          <Input
            placeholder="Interface adaptateur..."
            value={adapterFilter}
            onChange={(e) => setAdapterFilter(e.target.value)}
            data-testid="filter-adapter"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">ID annonce</label>
          <Input
            placeholder="ID annonce..."
            value={listingIdFilter}
            onChange={(e) => setListingIdFilter(e.target.value)}
            data-testid="filter-listing-id"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button size="sm" onClick={handleApplyFilters} data-testid="apply-filters-btn">
            Filtrer
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetFilters}
            data-testid="reset-filters-btn"
          >
            Reset
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" data-testid="api-log-error">
          {error}
        </p>
      )}

      {/* Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("timestamp")}
                  data-testid="sort-timestamp"
                >
                  Horodatage <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>Adaptateur</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("providerKey")}
                  data-testid="sort-provider"
                >
                  Fournisseur <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("httpStatus")}
                  data-testid="sort-status"
                >
                  Statut <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("responseTimeMs")}
                  data-testid="sort-response-time"
                >
                  Temps (ms) <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("cost")}
                  data-testid="sort-cost"
                >
                  Cout <ArrowUpDown className="ml-1 size-3" />
                </Button>
              </TableHead>
              <TableHead>Erreur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Loader2
                    className="inline-block size-5 animate-spin"
                    data-testid="api-log-loading"
                  />
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                  data-testid="api-log-empty"
                >
                  Aucun appel API trouve
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.ID} data-testid={`api-log-row-${entry.ID}`}>
                  <TableCell className="text-xs font-mono">
                    {new Date(entry.timestamp).toLocaleString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-xs">{entry.adapterInterface}</TableCell>
                  <TableCell className="text-xs">{entry.providerKey}</TableCell>
                  <TableCell className="text-xs font-mono max-w-40 truncate" title={entry.endpoint}>
                    {entry.endpoint}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(entry.httpStatus)}>{entry.httpStatus}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-right">{entry.responseTimeMs}</TableCell>
                  <TableCell className="text-xs text-right">
                    {Number(entry.cost).toFixed(4)}
                  </TableCell>
                  <TableCell
                    className="text-xs text-destructive max-w-32 truncate"
                    title={entry.errorMessage || ""}
                  >
                    {entry.errorMessage || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between" data-testid="api-log-pagination">
        <div className="text-sm text-muted-foreground">
          {totalCount} appel{totalCount !== 1 ? "s" : ""} au total
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(0);
            }}
          >
            <SelectTrigger className="w-20" data-testid="page-size-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              data-testid="prev-page-btn"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm px-2">
              {page + 1} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              data-testid="next-page-btn"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
