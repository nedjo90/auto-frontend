"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/auth/api-client";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileCompletionIndicator } from "@/components/profile/profile-completion-indicator";
import type { IProfileCompletionResult, IProfileUpdateInput } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface UserProfile extends IProfileUpdateInput {
  ID: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export default function ProfilePage() {
  const { hasRole } = useAuth();
  const isSeller = hasRole("seller");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completion, setCompletion] = useState<IProfileCompletionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, completionRes] = await Promise.all([
        apiClient(`${API_BASE}/api/profile/UserProfiles`),
        apiClient(`${API_BASE}/api/profile/getProfileCompletion()`),
      ]);

      if (!profileRes.ok || !completionRes.ok) {
        throw new Error("Erreur lors du chargement du profil");
      }

      const profileData = await profileRes.json();
      const completionData = await completionRes.json();

      // OData returns { value: [...] } for collections
      const user = Array.isArray(profileData.value) ? profileData.value[0] : profileData;
      setProfile(user);
      setCompletion(completionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex justify-center py-12" role="status">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Chargement du profil...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive" role="alert">
        {error || "Profil non trouvé"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos informations personnelles et professionnelles
        </p>
      </div>

      {/* Completion indicator */}
      {completion && (
        <Card className="p-6">
          <ProfileCompletionIndicator completion={completion} />
        </Card>
      )}

      {/* Profile form */}
      <Card className="p-6">
        <ProfileForm
          initialData={profile}
          avatarUrl={profile.avatarUrl}
          isSeller={isSeller}
          onSaved={fetchData}
        />
      </Card>
    </div>
  );
}
