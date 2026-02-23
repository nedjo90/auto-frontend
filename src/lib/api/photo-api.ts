import { apiClient } from "@/lib/auth/api-client";
import type { UploadPhotoResult } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface UploadPhotoParams {
  listingId: string;
  file: File;
  width?: number;
  height?: number;
}

export async function uploadPhoto(params: UploadPhotoParams): Promise<UploadPhotoResult> {
  const { listingId, file, width, height } = params;

  // Read file as ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""),
  );

  const res = await apiClient(`${API_BASE}/api/seller/uploadPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listingId,
      content: base64,
      mimeType: file.type,
      fileSize: file.size,
      width: width || 0,
      height: height || 0,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Upload failed: ${res.status} ${errorText}`);
  }

  return res.json();
}

export async function reorderPhotos(listingId: string, photoIds: string[]): Promise<void> {
  const res = await apiClient(`${API_BASE}/api/seller/reorderPhotos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      listingId,
      photoIds: JSON.stringify(photoIds),
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Reorder failed: ${res.status} ${errorText}`);
  }
}

export async function deletePhoto(listingId: string, photoId: string): Promise<void> {
  const res = await apiClient(`${API_BASE}/api/seller/deletePhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId, photoId }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Delete failed: ${res.status} ${errorText}`);
  }
}

export async function fetchListingPhotos(listingId: string): Promise<UploadPhotoResult[]> {
  const res = await apiClient(
    `${API_BASE}/api/seller/ListingPhotos?$filter=listingId eq '${listingId}'&$orderby=sortOrder asc`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch photos: ${res.status}`);
  }

  const data = await res.json();
  return data.value ?? [];
}
