"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DraftCard, type DraftCardData } from "@/components/listing/draft-card";
import { DeleteDraftDialog } from "@/components/listing/delete-draft-dialog";
import { fetchSellerDrafts, duplicateDraft, deleteDraft } from "@/lib/api/draft-api";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const loadDrafts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSellerDrafts();
      const mapped: DraftCardData[] = (data.value || []).map((d: Record<string, unknown>) => ({
        ID: d.ID as string,
        make: (d.make as string) || null,
        model: (d.model as string) || null,
        createdAt: d.createdAt as string,
        modifiedAt: d.modifiedAt as string | undefined,
        completionPercentage: (d.completionPercentage as number) || 0,
        visibilityScore: (d.visibilityScore as number) || 0,
        photoCount: (d.photoCount as number) || 0,
      }));
      setDrafts(mapped);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du chargement des brouillons");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/seller/create?draftId=${id}`);
    },
    [router],
  );

  const handleDuplicate = useCallback(
    async (id: string) => {
      try {
        const result = await duplicateDraft(id);
        if (result.success) {
          toast.success("Brouillon dupliqué");
          await loadDrafts();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de la duplication");
      }
    },
    [loadDrafts],
  );

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteTarget(id);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      const result = await deleteDraft(deleteTarget);
      if (result.success) {
        toast.success("Brouillon supprimé");
        setDrafts((prev) => prev.filter((d) => d.ID !== deleteTarget));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  if (isLoading) {
    return (
      <div data-testid="drafts-skeleton">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div data-testid="drafts-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes brouillons</h1>
        <Button onClick={() => router.push("/seller/create")} data-testid="create-listing-btn">
          <Plus className="mr-2 size-4" />
          Nouvelle annonce
        </Button>
      </div>

      {drafts.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-testid="drafts-empty-state"
        >
          <p className="text-lg text-muted-foreground mb-4">
            Aucun brouillon. Créez votre première annonce !
          </p>
          <Button onClick={() => router.push("/seller/create")} data-testid="empty-create-btn">
            <Plus className="mr-2 size-4" />
            Créer une annonce
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="drafts-grid">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.ID}
              draft={draft}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <DeleteDraftDialog
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
