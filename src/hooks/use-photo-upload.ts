"use client";

import { useCallback } from "react";
import { usePhotoStore, photoFromUploadResult } from "@/stores/photo-store";
import { uploadPhoto } from "@/lib/api/photo-api";
import { compressPhoto } from "@/lib/photo-compression";

let tempIdCounter = 0;

export function usePhotoUpload(listingId: string | null) {
  const { addPhoto, updatePhoto, removePhoto, photos, maxPhotos } = usePhotoStore();

  const processFiles = useCallback(
    async (files: File[]) => {
      if (!listingId) return;

      const remainingSlots = maxPhotos - photos.length;
      const filesToProcess = files.slice(0, remainingSlots);

      for (const file of filesToProcess) {
        const tempId = `temp-${++tempIdCounter}`;

        // Add placeholder with local preview
        const localPreviewUrl = URL.createObjectURL(file);
        addPhoto({
          id: tempId,
          cdnUrl: "",
          sortOrder: photos.length,
          isPrimary: photos.length === 0,
          fileSize: file.size,
          mimeType: file.type,
          width: 0,
          height: 0,
          localPreviewUrl,
          uploadStatus: "compressing",
          uploadProgress: 0,
        });

        try {
          // Compress
          updatePhoto(tempId, { uploadStatus: "compressing", uploadProgress: 20 });
          const compressed = await compressPhoto(file);

          // Upload
          updatePhoto(tempId, { uploadStatus: "uploading", uploadProgress: 50 });
          const result = await uploadPhoto({
            listingId,
            file: compressed.file,
            width: compressed.width,
            height: compressed.height,
          });

          // Replace temp with real photo
          const realPhoto = photoFromUploadResult(result);
          removePhoto(tempId);
          URL.revokeObjectURL(localPreviewUrl);
          addPhoto({ ...realPhoto, uploadStatus: "success", uploadProgress: 100 });
        } catch (err) {
          URL.revokeObjectURL(localPreviewUrl);
          updatePhoto(tempId, {
            uploadStatus: "error",
            errorMessage: err instanceof Error ? err.message : "Erreur lors de l'envoi de la photo",
            uploadProgress: 0,
          });
        }
      }
    },
    [listingId, addPhoto, updatePhoto, removePhoto, photos.length, maxPhotos],
  );

  return { processFiles };
}
