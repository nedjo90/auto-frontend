/**
 * Client-side photo compression.
 * Uses Canvas API to resize and compress images.
 * Strips EXIF data by re-drawing on canvas (privacy: no location data).
 */

const TARGET_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_DIMENSION = 2048; // Max width or height

export interface CompressedPhoto {
  file: File;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

/**
 * Compress a photo file.
 * - Resizes if larger than MAX_DIMENSION
 * - Compresses to JPEG if over TARGET_MAX_SIZE_BYTES
 * - Strips EXIF data (canvas re-draw)
 * - Converts HEIC to JPEG
 */
export async function compressPhoto(file: File): Promise<CompressedPhoto> {
  const originalSize = file.size;

  // Create image from file
  const imageBitmap = await createImageBitmap(file);
  const { width: origW, height: origH } = imageBitmap;

  // Calculate resize dimensions (maintain aspect ratio)
  let width = origW;
  let height = origH;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // Draw on canvas (strips EXIF data)
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context not available");
  }
  ctx.drawImage(imageBitmap, 0, 0, width, height);
  imageBitmap.close();

  // Determine output format
  // HEIC → JPEG, others keep their format unless too large
  const isHeic = file.type === "image/heic";
  const outputType = isHeic ? "image/jpeg" : file.type;

  // Try compressing at different quality levels
  let quality = 0.85;
  let blob = await canvas.convertToBlob({ type: outputType, quality });

  // If still too large, reduce quality
  while (blob.size > TARGET_MAX_SIZE_BYTES && quality > 0.3) {
    quality -= 0.1;
    blob = await canvas.convertToBlob({ type: outputType, quality });
  }

  // If still too large after quality reduction, fall back to JPEG
  if (blob.size > TARGET_MAX_SIZE_BYTES && outputType !== "image/jpeg") {
    quality = 0.7;
    blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  }

  const extension = outputType === "image/jpeg" ? ".jpg" : file.name.split(".").pop() || "jpg";
  const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, `.${extension}`), {
    type: blob.type,
  });

  return {
    file: compressedFile,
    width,
    height,
    originalSize,
    compressedSize: compressedFile.size,
  };
}

/**
 * Get image dimensions without full decode.
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  return { width, height };
}
