"use client";

import Link from "next/link";
import { FileText, User, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { IReport } from "@auto/shared";

interface ReportCardProps {
  report: IReport;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-orange-50 text-orange-700 border-orange-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  treated: "bg-green-50 text-green-700 border-green-200",
  dismissed: "bg-gray-50 text-gray-600 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  in_progress: "En cours",
  treated: "Traite",
  dismissed: "Rejete",
};

const TARGET_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  listing: FileText,
  user: User,
  chat: MessageSquare,
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  listing: "Annonce",
  user: "Utilisateur",
  chat: "Conversation",
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "a l'instant";
  if (diffMins < 60) return `il y a ${diffMins}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function ReportCard({ report }: ReportCardProps) {
  const TargetIcon = TARGET_TYPE_ICONS[report.targetType] || FileText;

  return (
    <Link href={`/moderator/reports/${report.ID}`} data-testid={`report-card-${report.ID}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            {/* Target type icon */}
            <div className="mt-0.5 shrink-0">
              <TargetIcon className="size-5 text-muted-foreground" />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Top row: target label + severity badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate">
                  {report.targetLabel || TARGET_TYPE_LABELS[report.targetType] || "Cible"}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${SEVERITY_STYLES[report.severity] || ""}`}
                  data-testid="severity-badge"
                >
                  {report.severity}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${STATUS_STYLES[report.status] || ""}`}
                  data-testid="status-badge"
                >
                  {STATUS_LABELS[report.status] || report.status}
                </Badge>
              </div>

              {/* Reason label */}
              <p className="text-sm text-muted-foreground truncate">{report.reasonLabel}</p>

              {/* Bottom row: reporter + date */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Signale par {report.reporterName || "Anonyme"}</span>
                <span>{formatRelativeDate(report.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
