"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateInputSchema } from "@auto/shared";
import type { IProfileUpdateInput } from "@auto/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AvatarUpload } from "./avatar-upload";
import { apiClient } from "@/lib/auth/api-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface ProfileFormProps {
  initialData: IProfileUpdateInput & { email: string; firstName: string; lastName: string };
  avatarUrl: string | null;
  isSeller: boolean;
  onSaved?: () => void;
}

export function ProfileForm({ initialData, avatarUrl, isSeller, onSaved }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<IProfileUpdateInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileUpdateInputSchema) as any,
    defaultValues: {
      displayName: initialData.displayName || "",
      phone: initialData.phone || "",
      addressStreet: initialData.addressStreet || "",
      addressCity: initialData.addressCity || "",
      addressPostalCode: initialData.addressPostalCode || "",
      addressCountry: initialData.addressCountry || "FR",
      siret: initialData.siret || "",
      companyName: initialData.companyName || "",
      bio: initialData.bio || "",
    },
  });

  const initials =
    `${initialData.firstName?.[0] || ""}${initialData.lastName?.[0] || ""}`.toUpperCase();

  async function onSubmit(data: IProfileUpdateInput) {
    try {
      const response = await apiClient(`${API_BASE}/api/profile/updateProfile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: data }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: { message: "Erreur serveur" } }));
        throw new Error(body.error?.message || "Erreur lors de la sauvegarde");
      }

      toast.success("Profil mis à jour avec succès");
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    }
  }

  function handleAvatarUpload(url: string) {
    setValue("avatarUrl", url);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Avatar */}
      <AvatarUpload
        currentUrl={avatarUrl}
        initials={initials}
        onUpload={handleAvatarUpload}
        disabled={isSubmitting}
      />

      {/* Read-only fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={initialData.email} disabled />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="displayName">Nom d&apos;affichage</Label>
          <Input
            id="displayName"
            placeholder="Ex: Marie D."
            aria-invalid={!!errors.displayName}
            disabled={isSubmitting}
            {...register("displayName")}
          />
          {errors.displayName && (
            <p className="text-sm text-destructive" role="alert">
              {String(errors.displayName.message)}
            </p>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            aria-invalid={!!errors.phone}
            disabled={isSubmitting}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-destructive" role="alert">
              {String(errors.phone.message)}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Adresse</legend>
        <div className="space-y-1.5">
          <Label htmlFor="addressStreet">Rue</Label>
          <Input id="addressStreet" disabled={isSubmitting} {...register("addressStreet")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="addressPostalCode">Code postal</Label>
            <Input
              id="addressPostalCode"
              aria-invalid={!!errors.addressPostalCode}
              disabled={isSubmitting}
              {...register("addressPostalCode")}
            />
            {errors.addressPostalCode && (
              <p className="text-sm text-destructive" role="alert">
                {String(errors.addressPostalCode.message)}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressCity">Ville</Label>
            <Input id="addressCity" disabled={isSubmitting} {...register("addressCity")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressCountry">Pays</Label>
            <Input id="addressCountry" disabled={isSubmitting} {...register("addressCountry")} />
          </div>
        </div>
      </fieldset>

      {/* Seller fields */}
      {isSeller && (
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Informations professionnelles</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                placeholder="14 chiffres"
                maxLength={14}
                aria-invalid={!!errors.siret}
                disabled={isSubmitting}
                {...register("siret")}
              />
              {errors.siret && (
                <p className="text-sm text-destructive" role="alert">
                  {String(errors.siret.message)}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
              <Input id="companyName" disabled={isSubmitting} {...register("companyName")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={500}
              placeholder="Présentez-vous en quelques mots..."
              disabled={isSubmitting}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive" role="alert">
                {String(errors.bio.message)}
              </p>
            )}
          </div>
        </fieldset>
      )}

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Enregistrer les modifications"
        )}
      </Button>
    </form>
  );
}
