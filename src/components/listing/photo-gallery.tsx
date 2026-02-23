"use client";

import { useCallback, useState, useRef, useId } from "react";
import { Trash2, GripVertical, Star } from "lucide-react";
import type { PhotoItem } from "@/stores/photo-store";

export interface PhotoGalleryProps {
  photos: PhotoItem[];
  onReorder: (photoIds: string[]) => void;
  onDelete: (photoId: string) => void;
  disabled?: boolean;
}

export function PhotoGallery({ photos, onReorder, onDelete, disabled = false }: PhotoGalleryProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const galleryRef = useRef<HTMLDivElement>(null);
  const galleryId = useId();

  // ─── Drag and Drop ──────────────────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, photoId: string) => {
      if (disabled) return;
      setDraggedId(photoId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", photoId);
    },
    [disabled],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData("text/plain");
      if (!sourceId || sourceId === targetId || disabled) return;

      const currentIds = photos.map((p) => p.id);
      const sourceIndex = currentIds.indexOf(sourceId);
      const targetIndex = currentIds.indexOf(targetId);
      if (sourceIndex === -1 || targetIndex === -1) return;

      // Move source to target position
      const newIds = [...currentIds];
      newIds.splice(sourceIndex, 1);
      newIds.splice(targetIndex, 0, sourceId);

      onReorder(newIds);
      setDraggedId(null);
    },
    [photos, onReorder, disabled],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  // ─── Keyboard Reordering ──────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (disabled) return;

      const ids = photos.map((p) => p.id);
      let newIndex = -1;

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        newIndex = Math.max(0, index - 1);
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        newIndex = Math.min(ids.length - 1, index + 1);
      } else if (e.key === " " || e.key === "Enter") {
        // Space/Enter with Shift to move, otherwise just focus
        if (e.shiftKey) {
          e.preventDefault();
          // Move item one position in the arrow direction (use last arrow press)
          return;
        }
        return;
      } else {
        return;
      }

      if (newIndex !== index && newIndex >= 0) {
        // Move item
        const newIds = [...ids];
        const [moved] = newIds.splice(index, 1);
        newIds.splice(newIndex, 0, moved);
        onReorder(newIds);
        setFocusedIndex(newIndex);

        // Focus the moved item
        requestAnimationFrame(() => {
          const items = galleryRef.current?.querySelectorAll("[data-photo-item]");
          (items?.[newIndex] as HTMLElement)?.focus();
        });
      }
    },
    [photos, onReorder, disabled],
  );

  // ─── Delete confirmation ──────────────────────────────────────────

  const handleDeleteClick = useCallback(
    (photoId: string) => {
      if (deleteConfirmId === photoId) {
        onDelete(photoId);
        setDeleteConfirmId(null);
      } else {
        setDeleteConfirmId(photoId);
      }
    },
    [deleteConfirmId, onDelete],
  );

  const handleDeleteBlur = useCallback(() => {
    // Reset confirmation when focus leaves the delete button
    setTimeout(() => setDeleteConfirmId(null), 200);
  }, []);

  if (photos.length === 0) {
    return (
      <div
        data-testid="photo-gallery-empty"
        className="py-8 text-center text-sm text-muted-foreground"
      >
        Aucune photo ajoutée
      </div>
    );
  }

  return (
    <div
      ref={galleryRef}
      data-testid="photo-gallery"
      role="list"
      aria-label="Galerie photos"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
    >
      {photos.map((photo, index) => {
        const isDragged = draggedId === photo.id;
        const isConfirmingDelete = deleteConfirmId === photo.id;
        const imageUrl = photo.localPreviewUrl || photo.cdnUrl;
        const isUploading =
          photo.uploadStatus === "compressing" || photo.uploadStatus === "uploading";
        const isError = photo.uploadStatus === "error";

        return (
          <div
            key={photo.id}
            data-testid={`photo-item-${photo.id}`}
            data-photo-item
            role="listitem"
            tabIndex={0}
            draggable={!disabled && !isUploading}
            onDragStart={(e) => handleDragStart(e, photo.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, photo.id)}
            onDragEnd={handleDragEnd}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => setFocusedIndex(index)}
            aria-label={`Photo ${index + 1}${photo.isPrimary ? " (principale)" : ""}. Utilisez les flèches pour réorganiser.`}
            className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
              isDragged
                ? "border-primary opacity-50"
                : focusedIndex === index
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border"
            } ${isError ? "border-destructive" : ""}`}
          >
            {/* Photo image */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            )}

            {/* Upload progress overlay */}
            {isUploading && (
              <div
                data-testid={`photo-progress-${photo.id}`}
                className="absolute inset-0 flex items-center justify-center bg-black/50"
              >
                <div className="h-2 w-3/4 overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${photo.uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error overlay */}
            {isError && (
              <div
                data-testid={`photo-error-${photo.id}`}
                className="absolute inset-0 flex items-center justify-center bg-destructive/50 p-2 text-center text-xs text-white"
              >
                {photo.errorMessage || "Erreur"}
              </div>
            )}

            {/* Success checkmark */}
            {photo.uploadStatus === "success" && !isError && (
              <div className="absolute right-1 top-1 rounded-full bg-green-500 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
            )}

            {/* Primary badge */}
            {photo.isPrimary && (
              <div
                data-testid="photo-primary-badge"
                className="absolute left-1 top-1 flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground"
              >
                <Star className="h-3 w-3" />
                <span className="hidden sm:inline">Principale</span>
              </div>
            )}

            {/* Drag handle + delete controls */}
            {!isUploading && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <div
                  className="min-h-[44px] min-w-[44px] cursor-grab p-2 text-white"
                  aria-hidden="true"
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  data-testid={`photo-delete-${photo.id}`}
                  onClick={() => handleDeleteClick(photo.id)}
                  onBlur={handleDeleteBlur}
                  disabled={disabled}
                  className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded p-2 text-white transition-colors ${
                    isConfirmingDelete ? "bg-destructive" : "hover:bg-destructive/80"
                  }`}
                  aria-label={
                    isConfirmingDelete
                      ? "Confirmer la suppression"
                      : `Supprimer la photo ${index + 1}`
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
