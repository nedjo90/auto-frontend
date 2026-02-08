"use client";

import { useAuth } from "@/hooks/use-auth";
import { useFeatureConfig } from "@/hooks/use-feature-config";
import { RegistrationWall } from "./registration-wall";

interface AuthRequiredWrapperProps {
  featureCode: string;
  children: React.ReactNode;
}

export function AuthRequiredWrapper({ featureCode, children }: AuthRequiredWrapperProps) {
  const { isAuthenticated } = useAuth();
  const { isFeatureAuthRequired } = useFeatureConfig();

  if (!isAuthenticated && isFeatureAuthRequired(featureCode)) {
    return <RegistrationWall>{children}</RegistrationWall>;
  }

  return <>{children}</>;
}
