"use client";

import Image from "next/image";

export type ImageVariant = "thumbnail" | "medium" | "full";

const VARIANT_SIZES: Record<ImageVariant, { width: number; height: number; sizes: string }> = {
  thumbnail: {
    width: 320,
    height: 240,
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  },
  medium: {
    width: 640,
    height: 480,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  },
  full: {
    width: 1200,
    height: 900,
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw",
  },
};

export interface ListingImageProps {
  src: string;
  alt: string;
  variant?: ImageVariant;
  priority?: boolean;
  className?: string;
}

export function ListingImage({
  src,
  alt,
  variant = "medium",
  priority = false,
  className,
}: ListingImageProps) {
  const config = VARIANT_SIZES[variant];

  return (
    <Image
      src={src}
      alt={alt}
      width={config.width}
      height={config.height}
      sizes={config.sizes}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
}
