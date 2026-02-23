import { create } from "zustand";
import type { UploadPhotoResult } from "@auto/shared";

export type PhotoUploadStatus = "idle" | "compressing" | "uploading" | "success" | "error";

export interface PhotoItem {
  id: string;
  cdnUrl: string;
  sortOrder: number;
  isPrimary: boolean;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  // Local-only fields for upload UI
  localPreviewUrl?: string;
  uploadStatus: PhotoUploadStatus;
  uploadProgress: number; // 0-100
  errorMessage?: string;
}

export interface PhotoStoreState {
  photos: PhotoItem[];
  maxPhotos: number;
  isLoading: boolean;

  setPhotos: (photos: PhotoItem[]) => void;
  setMaxPhotos: (max: number) => void;
  setLoading: (loading: boolean) => void;
  addPhoto: (photo: PhotoItem) => void;
  removePhoto: (id: string) => void;
  updatePhoto: (id: string, updates: Partial<PhotoItem>) => void;
  reorderPhotos: (photoIds: string[]) => void;
  getPhoto: (id: string) => PhotoItem | undefined;
  getRemainingSlots: () => number;
}

export function photoFromUploadResult(result: UploadPhotoResult): PhotoItem {
  return {
    id: result.ID,
    cdnUrl: result.cdnUrl,
    sortOrder: result.sortOrder,
    isPrimary: result.isPrimary,
    fileSize: result.fileSize,
    mimeType: result.mimeType,
    width: result.width,
    height: result.height,
    uploadStatus: "success",
    uploadProgress: 100,
  };
}

export const usePhotoStore = create<PhotoStoreState>((set, get) => ({
  photos: [],
  maxPhotos: 20,
  isLoading: false,

  setPhotos: (photos) => set({ photos }),
  setMaxPhotos: (max) => set({ maxPhotos: max }),
  setLoading: (loading) => set({ isLoading: loading }),

  addPhoto: (photo) => {
    const current = get().photos;
    set({ photos: [...current, photo] });
  },

  removePhoto: (id) => {
    const current = get().photos;
    const filtered = current.filter((p) => p.id !== id);
    // Recalculate sort orders and primary
    const reordered = filtered.map((p, i) => ({
      ...p,
      sortOrder: i,
      isPrimary: i === 0,
    }));
    set({ photos: reordered });
  },

  updatePhoto: (id, updates) => {
    const current = get().photos;
    set({
      photos: current.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  },

  reorderPhotos: (photoIds) => {
    const current = get().photos;
    const idMap = new Map(current.map((p) => [p.id, p]));
    const reordered: PhotoItem[] = [];
    for (let i = 0; i < photoIds.length; i++) {
      const photo = idMap.get(photoIds[i]);
      if (photo) {
        reordered.push({ ...photo, sortOrder: i, isPrimary: i === 0 });
      }
    }
    set({ photos: reordered });
  },

  getPhoto: (id) => get().photos.find((p) => p.id === id),
  getRemainingSlots: () => get().maxPhotos - get().photos.length,
}));
