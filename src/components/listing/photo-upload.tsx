"use client";

import { useCallback, useRef, useId } from "react";
import { Camera, Upload, ImagePlus } from "lucide-react";
import { PHOTO_ALLOWED_MIME_TYPES } from "@auto/shared";

export interface PhotoUploadProps {
  onFilesSelected: (files: File[]) => void;
  currentCount: number;
  maxPhotos: number;
  disabled?: boolean;
}

const ACCEPT = PHOTO_ALLOWED_MIME_TYPES.join(",");

export function PhotoUpload({
  onFilesSelected,
  currentCount,
  maxPhotos,
  disabled = false,
}: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadId = useId();

  const remainingSlots = maxPhotos - currentCount;
  const isAtLimit = remainingSlots <= 0;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList).slice(0, remainingSlots);
      onFilesSelected(files);

      // Reset input to allow re-selecting same files
      e.target.value = "";
    },
    [onFilesSelected, remainingSlots],
  );

  const handlePickerClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCameraClick = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  return (
    <div data-testid="photo-upload" className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor={uploadId} data-testid="photo-upload-label" className="text-sm font-medium">
          Photos du véhicule
        </label>
        <span data-testid="photo-count" className="text-sm text-muted-foreground">
          {currentCount}/{maxPhotos} photos
        </span>
      </div>

      <div className="flex gap-3">
        {/* File picker button */}
        <button
          type="button"
          data-testid="photo-picker-btn"
          onClick={handlePickerClick}
          disabled={disabled || isAtLimit}
          className="flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Sélectionner des photos"
        >
          <Upload className="h-5 w-5" />
          <span className="hidden sm:inline">Sélectionner</span>
        </button>

        {/* Camera capture button (PWA) */}
        <button
          type="button"
          data-testid="photo-camera-btn"
          onClick={handleCameraClick}
          disabled={disabled || isAtLimit}
          className="flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Prendre une photo"
        >
          <Camera className="h-5 w-5" />
          <span className="hidden sm:inline">Appareil photo</span>
        </button>
      </div>

      {isAtLimit && (
        <p
          data-testid="photo-limit-message"
          className="text-sm text-muted-foreground"
          role="status"
        >
          Nombre maximum de photos atteint ({maxPhotos})
        </p>
      )}

      {remainingSlots > 0 && remainingSlots <= 3 && (
        <p className="text-sm text-muted-foreground" role="status">
          {remainingSlots} emplacement{remainingSlots > 1 ? "s" : ""} restant
          {remainingSlots > 1 ? "s" : ""}
        </p>
      )}

      {/* Drop zone for drag-and-drop file selection */}
      {!isAtLimit && (
        <DropZone
          onFilesDropped={(files) => onFilesSelected(files.slice(0, remainingSlots))}
          disabled={disabled}
        />
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        id={uploadId}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleFileChange}
        className="sr-only"
        data-testid="photo-file-input"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="sr-only"
        data-testid="photo-camera-input"
      />
    </div>
  );
}

// ─── Drop Zone ──────────────────────────────────────────────────────────

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void;
  disabled?: boolean;
}

function DropZone({ onFilesDropped, disabled }: DropZoneProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        (PHOTO_ALLOWED_MIME_TYPES as readonly string[]).includes(f.type),
      );

      if (files.length > 0) {
        onFilesDropped(files);
      }
    },
    [onFilesDropped, disabled],
  );

  return (
    <div
      data-testid="photo-drop-zone"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/50"
    >
      <div className="flex flex-col items-center gap-2">
        <ImagePlus className="h-8 w-8" />
        <span>Glissez-déposez vos photos ici</span>
      </div>
    </div>
  );
}
