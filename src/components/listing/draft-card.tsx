"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Camera, Copy, Pencil, Trash2 } from "lucide-react";

export interface DraftCardData {
  ID: string;
  make: string | null;
  model: string | null;
  createdAt: string;
  modifiedAt?: string;
  completionPercentage: number;
  visibilityScore: number;
  photoCount: number;
}

export interface DraftCardProps {
  draft: DraftCardData;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DraftCard({ draft, onEdit, onDuplicate, onDelete }: DraftCardProps) {
  const title = draft.make && draft.model ? `${draft.make} ${draft.model}` : "Nouveau véhicule";

  return (
    <Card data-testid={`draft-card-${draft.ID}`}>
      <CardHeader>
        <CardTitle className="text-base" data-testid="draft-card-title">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Creation date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4" />
          <span data-testid="draft-card-date">{formatDate(draft.createdAt)}</span>
        </div>

        {/* Completion percentage */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Complétion</span>
            <span data-testid="draft-card-completion">{draft.completionPercentage}%</span>
          </div>
          <div
            className="h-2 rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={draft.completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Complétion : ${draft.completionPercentage}%`}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                draft.completionPercentage >= 80
                  ? "bg-green-600"
                  : draft.completionPercentage >= 50
                    ? "bg-yellow-500"
                    : "bg-muted-foreground/30",
              )}
              style={{ width: `${draft.completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Visibility score + photo count */}
        <div className="flex items-center justify-between">
          <Badge
            variant={
              draft.visibilityScore >= 80
                ? "default"
                : draft.visibilityScore >= 50
                  ? "secondary"
                  : "outline"
            }
            className={cn(
              draft.visibilityScore >= 80 && "bg-green-600 text-white",
              draft.visibilityScore >= 50 &&
                draft.visibilityScore < 80 &&
                "bg-yellow-500 text-black",
            )}
            data-testid="draft-card-score"
          >
            Score : {draft.visibilityScore}%
          </Badge>

          <div
            className="flex items-center gap-1 text-sm text-muted-foreground"
            data-testid="draft-card-photos"
          >
            <Camera className="size-4" />
            <span>{draft.photoCount}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button size="sm" onClick={() => onEdit(draft.ID)} data-testid="draft-edit-btn">
          <Pencil className="mr-1 size-3.5" />
          Modifier
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDuplicate(draft.ID)}
          data-testid="draft-duplicate-btn"
        >
          <Copy className="mr-1 size-3.5" />
          Dupliquer
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(draft.ID)}
          data-testid="draft-delete-btn"
        >
          <Trash2 className="mr-1 size-3.5" />
          Supprimer
        </Button>
      </CardFooter>
    </Card>
  );
}
