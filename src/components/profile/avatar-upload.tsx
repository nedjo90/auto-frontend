"use client";

import { useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AvatarUploadProps {
  currentUrl: string | null;
  initials: string;
  onUpload: (url: string) => void;
  disabled?: boolean;
}

export function AvatarUpload({ currentUrl, initials, onUpload, disabled }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format non supporté. Utilisez JPEG, PNG ou WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Le fichier est trop volumineux (max 5 Mo).");
      return;
    }

    setError(null);

    // Preview the image locally
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      // TODO: In production, upload to blob storage and return an HTTPS URL.
      // For now, store preview locally only (not submitted to backend).
      onUpload(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        <AvatarImage src={preview || currentUrl || undefined} alt="Avatar" />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Camera className="mr-1.5 size-4" />
          Changer la photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Choisir une photo de profil"
        />
        {error && (
          <p className="mt-1 flex items-center gap-1 text-xs text-destructive" role="alert">
            <AlertCircle className="size-3" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
