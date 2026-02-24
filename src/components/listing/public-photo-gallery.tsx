"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IListingPhoto } from "@auto/shared";
import { buildImageUrl } from "@/lib/api/catalog-api";

export interface PublicPhotoGalleryProps {
  photos: IListingPhoto[];
  title: string;
}

/**
 * Public-facing photo gallery for listing detail page.
 * Desktop: 60% width, thumbnail strip below.
 * Mobile: full-width, swipe navigation.
 */
export function PublicPhotoGallery({ photos, title }: PublicPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < photos.length) {
        setActiveIndex(index);
      }
    },
    [photos.length],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  if (photos.length === 0) {
    return (
      <div
        className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted"
        data-testid="gallery-empty"
      >
        <span className="text-muted-foreground">Pas de photo disponible</span>
      </div>
    );
  }

  const activePhoto = photos[activeIndex];

  return (
    <div data-testid="public-photo-gallery">
      {/* Main image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        <Image
          src={buildImageUrl(activePhoto?.cdnUrl || null, { width: 1200 })}
          alt={`${title} - Photo ${activeIndex + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority={activeIndex === 0}
          data-testid="gallery-main-image"
        />

        {/* Navigation arrows */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 min-h-10 min-w-10"
              onClick={goPrev}
              disabled={activeIndex === 0}
              aria-label="Photo précédente"
              data-testid="gallery-prev"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white hover:bg-black/60 min-h-10 min-w-10"
              onClick={goNext}
              disabled={activeIndex === photos.length - 1}
              aria-label="Photo suivante"
              data-testid="gallery-next"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
            {activeIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div
          className="mt-2 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          data-testid="gallery-thumbnails"
        >
          {photos.map((photo, index) => (
            <button
              key={photo.ID}
              role="tab"
              aria-selected={index === activeIndex}
              className={cn(
                "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border-2 sm:h-16 sm:w-16",
                index === activeIndex
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
              onClick={() => goTo(index)}
              data-testid={`gallery-thumb-${index}`}
            >
              <Image
                src={buildImageUrl(photo.cdnUrl || null, { width: 100 })}
                alt={`${title} - Miniature ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
