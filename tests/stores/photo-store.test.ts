import { describe, it, expect, beforeEach } from "vitest";
import { usePhotoStore, photoFromUploadResult } from "@/stores/photo-store";
import type { PhotoItem } from "@/stores/photo-store";
import type { UploadPhotoResult } from "@auto/shared";

function makePhoto(overrides: Partial<PhotoItem> = {}): PhotoItem {
  return {
    id: "photo-1",
    cdnUrl: "https://cdn.example.com/photo1.jpg",
    sortOrder: 0,
    isPrimary: true,
    fileSize: 1024,
    mimeType: "image/jpeg",
    width: 800,
    height: 600,
    uploadStatus: "success",
    uploadProgress: 100,
    ...overrides,
  };
}

describe("photoStore", () => {
  beforeEach(() => {
    // Reset store state
    usePhotoStore.setState({
      photos: [],
      maxPhotos: 20,
      isLoading: false,
    });
  });

  describe("setPhotos", () => {
    it("should replace all photos", () => {
      const photos = [makePhoto(), makePhoto({ id: "photo-2", sortOrder: 1, isPrimary: false })];
      usePhotoStore.getState().setPhotos(photos);
      expect(usePhotoStore.getState().photos).toHaveLength(2);
    });
  });

  describe("addPhoto", () => {
    it("should add a photo to the list", () => {
      usePhotoStore.getState().addPhoto(makePhoto());
      expect(usePhotoStore.getState().photos).toHaveLength(1);
      expect(usePhotoStore.getState().photos[0].id).toBe("photo-1");
    });
  });

  describe("removePhoto", () => {
    it("should remove photo and reorder remaining", () => {
      usePhotoStore
        .getState()
        .setPhotos([
          makePhoto({ id: "p1", sortOrder: 0, isPrimary: true }),
          makePhoto({ id: "p2", sortOrder: 1, isPrimary: false }),
          makePhoto({ id: "p3", sortOrder: 2, isPrimary: false }),
        ]);

      usePhotoStore.getState().removePhoto("p2");
      const photos = usePhotoStore.getState().photos;

      expect(photos).toHaveLength(2);
      expect(photos[0].id).toBe("p1");
      expect(photos[0].sortOrder).toBe(0);
      expect(photos[0].isPrimary).toBe(true);
      expect(photos[1].id).toBe("p3");
      expect(photos[1].sortOrder).toBe(1);
      expect(photos[1].isPrimary).toBe(false);
    });

    it("should promote second photo to primary when first is removed", () => {
      usePhotoStore
        .getState()
        .setPhotos([
          makePhoto({ id: "p1", sortOrder: 0, isPrimary: true }),
          makePhoto({ id: "p2", sortOrder: 1, isPrimary: false }),
        ]);

      usePhotoStore.getState().removePhoto("p1");
      const photos = usePhotoStore.getState().photos;

      expect(photos).toHaveLength(1);
      expect(photos[0].id).toBe("p2");
      expect(photos[0].isPrimary).toBe(true);
      expect(photos[0].sortOrder).toBe(0);
    });
  });

  describe("updatePhoto", () => {
    it("should update specific fields of a photo", () => {
      usePhotoStore.getState().addPhoto(makePhoto());
      usePhotoStore.getState().updatePhoto("photo-1", {
        uploadStatus: "uploading",
        uploadProgress: 50,
      });

      const photo = usePhotoStore.getState().photos[0];
      expect(photo.uploadStatus).toBe("uploading");
      expect(photo.uploadProgress).toBe(50);
      expect(photo.cdnUrl).toBe("https://cdn.example.com/photo1.jpg"); // unchanged
    });
  });

  describe("reorderPhotos", () => {
    it("should reorder photos by ID array and update primary", () => {
      usePhotoStore
        .getState()
        .setPhotos([
          makePhoto({ id: "p1", sortOrder: 0, isPrimary: true }),
          makePhoto({ id: "p2", sortOrder: 1, isPrimary: false }),
          makePhoto({ id: "p3", sortOrder: 2, isPrimary: false }),
        ]);

      usePhotoStore.getState().reorderPhotos(["p3", "p1", "p2"]);
      const photos = usePhotoStore.getState().photos;

      expect(photos[0].id).toBe("p3");
      expect(photos[0].sortOrder).toBe(0);
      expect(photos[0].isPrimary).toBe(true);
      expect(photos[1].id).toBe("p1");
      expect(photos[1].sortOrder).toBe(1);
      expect(photos[1].isPrimary).toBe(false);
      expect(photos[2].id).toBe("p2");
      expect(photos[2].sortOrder).toBe(2);
      expect(photos[2].isPrimary).toBe(false);
    });
  });

  describe("getRemainingSlots", () => {
    it("should return correct remaining slots", () => {
      usePhotoStore.getState().setMaxPhotos(10);
      usePhotoStore.getState().setPhotos([makePhoto(), makePhoto({ id: "p2" })]);
      expect(usePhotoStore.getState().getRemainingSlots()).toBe(8);
    });

    it("should return 0 when at limit", () => {
      usePhotoStore.getState().setMaxPhotos(1);
      usePhotoStore.getState().addPhoto(makePhoto());
      expect(usePhotoStore.getState().getRemainingSlots()).toBe(0);
    });
  });

  describe("getPhoto", () => {
    it("should return photo by ID", () => {
      usePhotoStore.getState().addPhoto(makePhoto());
      expect(usePhotoStore.getState().getPhoto("photo-1")?.id).toBe("photo-1");
    });

    it("should return undefined for non-existent ID", () => {
      expect(usePhotoStore.getState().getPhoto("nonexistent")).toBeUndefined();
    });
  });
});

describe("photoFromUploadResult", () => {
  it("should convert UploadPhotoResult to PhotoItem", () => {
    const result: UploadPhotoResult = {
      ID: "id-1",
      cdnUrl: "https://cdn.example.com/photo.jpg",
      sortOrder: 0,
      isPrimary: true,
      fileSize: 2048,
      mimeType: "image/jpeg",
      width: 1920,
      height: 1080,
    };

    const item = photoFromUploadResult(result);
    expect(item.id).toBe("id-1");
    expect(item.cdnUrl).toBe("https://cdn.example.com/photo.jpg");
    expect(item.uploadStatus).toBe("success");
    expect(item.uploadProgress).toBe(100);
  });
});
