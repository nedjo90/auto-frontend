import type { Metadata } from "next";
import { LEGAL_DOCUMENT_LABELS } from "@auto/shared";
import type { LegalDocumentKey } from "@auto/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface LegalPageProps {
  params: Promise<{ key: string }>;
}

async function fetchLegalContent(key: string) {
  try {
    const res = await fetch(
      `${API_BASE}/api/legal/getCurrentVersion(documentKey='${encodeURIComponent(key)}')`,
      { next: { revalidate: 3600 } },
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch legal content: ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Error fetching legal content:", error);
    return null;
  }
}

export async function generateMetadata({ params }: LegalPageProps): Promise<Metadata> {
  const { key } = await params;
  const decodedKey = decodeURIComponent(key);
  const label = LEGAL_DOCUMENT_LABELS[decodedKey as LegalDocumentKey] || decodedKey;

  return {
    title: `${label} | Auto`,
    description: `${label} de la plateforme Auto.`,
  };
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { key } = await params;
  const decodedKey = decodeURIComponent(key);
  const label = LEGAL_DOCUMENT_LABELS[decodedKey as LegalDocumentKey] || decodedKey;

  const versionData = await fetchLegalContent(decodedKey);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <h1
        className="mb-4 sm:mb-6 text-xl font-bold sm:text-2xl lg:text-3xl"
        data-testid="legal-page-title"
      >
        {label}
      </h1>

      {versionData ? (
        <div className="space-y-3 sm:space-y-4">
          <div
            className="prose prose-sm max-w-none whitespace-pre-wrap"
            data-testid="legal-page-content"
          >
            {versionData.content}
          </div>
          <p className="text-xs text-muted-foreground" data-testid="legal-page-version">
            Version {versionData.version}
            {versionData.publishedAt &&
              ` — Publiee le ${new Date(versionData.publishedAt).toLocaleDateString("fr-FR")}`}
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground" data-testid="legal-page-not-found">
          Document non disponible.
        </p>
      )}
    </div>
  );
}
