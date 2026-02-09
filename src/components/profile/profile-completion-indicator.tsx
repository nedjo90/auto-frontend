"use client";

import { cn } from "@/lib/utils";
import type { IProfileCompletionResult } from "@auto/shared";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useState } from "react";

interface ProfileCompletionIndicatorProps {
  completion: IProfileCompletionResult;
  className?: string;
}

const badgeLabels: Record<string, string> = {
  complete: "Profil complet",
  advanced: "Profil avancé",
  intermediate: "Profil intermédiaire",
  new_seller: "Nouveau vendeur",
};

const tipMessages: Record<string, string> = {
  "profile.tip.phone":
    "Ajoutez votre numéro de téléphone pour faciliter les échanges avec les acheteurs",
  "profile.tip.address": "Renseignez votre adresse pour renforcer la confiance des acheteurs",
  "profile.tip.siret": "Ajoutez votre numéro SIRET pour renforcer votre crédibilité",
  "profile.tip.companyName":
    "Indiquez le nom de votre entreprise pour une image plus professionnelle",
  "profile.tip.avatar": "Ajoutez une photo de profil pour personnaliser votre compte",
  "profile.tip.bio": "Rédigez une courte bio pour vous présenter aux acheteurs",
  "profile.tip.displayName": "Choisissez un nom d'affichage pour être facilement identifiable",
};

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return "text-green-500";
  if (percentage >= 50) return "text-orange-500";
  return "text-red-500";
}

function getStrokeColor(percentage: number): string {
  if (percentage >= 80) return "stroke-green-500";
  if (percentage >= 50) return "stroke-orange-500";
  return "stroke-red-500";
}

export function ProfileCompletionIndicator({
  completion,
  className,
}: ProfileCompletionIndicatorProps) {
  const [expanded, setExpanded] = useState(false);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion.percentage / 100) * circumference;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-4">
        {/* Circular progress */}
        <div className="relative size-20 shrink-0">
          <svg
            className="-rotate-90"
            width="80"
            height="80"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn("transition-all duration-500", getStrokeColor(completion.percentage))}
            />
          </svg>
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center text-sm font-bold",
              getProgressColor(completion.percentage),
            )}
          >
            {completion.percentage}%
          </span>
        </div>

        <div>
          <p className="font-medium">{badgeLabels[completion.badge] || completion.badge}</p>
          <p className="text-sm text-muted-foreground">Complétion du profil</p>
        </div>
      </div>

      {/* Expandable tips section */}
      {completion.incompleteFields.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            {completion.incompleteFields.length} champ
            {completion.incompleteFields.length > 1 ? "s" : ""} à compléter
          </button>

          {expanded && (
            <ul className="mt-2 space-y-2">
              {completion.incompleteFields.map((field) => (
                <li key={field.fieldName} className="flex items-start gap-2 text-sm">
                  <Lightbulb
                    className="mt-0.5 size-4 shrink-0 text-yellow-500"
                    aria-hidden="true"
                  />
                  <span>
                    {field.tipKey
                      ? tipMessages[field.tipKey] || field.tipKey
                      : `Complétez le champ ${field.fieldName}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
