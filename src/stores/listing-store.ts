import { create } from "zustand";
import type { ListingFieldState, FieldStatus } from "@auto/shared";
import type { CertifiedFieldResult } from "@auto/shared";

export interface ListingFormState {
  listingId: string | null;
  fields: Record<string, ListingFieldState>;
  visibilityScore: number;
  visibilityLabel: string;
  completionPercentage: number;
  isLoading: boolean;
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving: boolean;

  setListingId: (id: string) => void;
  initializeFields: (certifiedFields: CertifiedFieldResult[]) => void;
  updateField: (fieldName: string, value: string | number | null, status: FieldStatus) => void;
  setFieldStatus: (fieldName: string, status: FieldStatus, certifiedSource?: string) => void;
  setVisibilityScore: (score: number) => void;
  setVisibilityLabel: (label: string) => void;
  setCompletionPercentage: (pct: number) => void;
  setLoading: (loading: boolean) => void;
  setDirty: (dirty: boolean) => void;
  setLastSavedAt: (date: Date | null) => void;
  setSaving: (saving: boolean) => void;
  getFieldState: (fieldName: string) => ListingFieldState | undefined;
  setOriginalCertifiedValue: (fieldName: string, originalValue: string) => void;
  resetDraftState: () => void;
}

export const useListingStore = create<ListingFormState>((set, get) => ({
  listingId: null,
  fields: {},
  visibilityScore: 0,
  visibilityLabel: "Partiellement documenté",
  completionPercentage: 0,
  isLoading: false,
  isDirty: false,
  lastSavedAt: null,
  isSaving: false,

  setListingId: (id) => set({ listingId: id }),

  initializeFields: (certifiedFields) => {
    // F7: Merge certified fields into existing fields to preserve user-input declared fields
    const currentFields = get().fields;
    const newFields: Record<string, ListingFieldState> = { ...currentFields };
    for (const cf of certifiedFields) {
      newFields[cf.fieldName] = {
        fieldName: cf.fieldName,
        value: cf.fieldValue,
        status: cf.isCertified ? "certified" : "declared",
        certifiedSource: cf.source,
        certifiedTimestamp: cf.sourceTimestamp,
      };
    }
    set({ fields: newFields });
  },

  updateField: (fieldName, value, status) => {
    const currentFields = get().fields;
    set({
      fields: {
        ...currentFields,
        [fieldName]: {
          ...currentFields[fieldName],
          fieldName,
          value,
          status,
        },
      },
      isDirty: true,
    });
  },

  setFieldStatus: (fieldName, status, certifiedSource) => {
    const currentFields = get().fields;
    const existing = currentFields[fieldName] || { fieldName, value: null, status: "empty" };
    set({
      fields: {
        ...currentFields,
        [fieldName]: {
          ...existing,
          status,
          ...(certifiedSource ? { certifiedSource } : {}),
        },
      },
    });
  },

  setVisibilityScore: (score) => set({ visibilityScore: score }),
  setVisibilityLabel: (label) => set({ visibilityLabel: label }),
  setCompletionPercentage: (pct) => set({ completionPercentage: pct }),

  setLoading: (loading) => set({ isLoading: loading }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
  setSaving: (saving) => set({ isSaving: saving }),

  getFieldState: (fieldName) => get().fields[fieldName],

  setOriginalCertifiedValue: (fieldName, originalValue) => {
    const currentFields = get().fields;
    const existing = currentFields[fieldName];
    if (existing) {
      set({
        fields: {
          ...currentFields,
          [fieldName]: {
            ...existing,
            originalCertifiedValue: originalValue,
          },
        },
      });
    }
  },

  resetDraftState: () =>
    set({
      listingId: null,
      fields: {},
      visibilityScore: 0,
      visibilityLabel: "Partiellement documenté",
      completionPercentage: 0,
      isLoading: false,
      isDirty: false,
      lastSavedAt: null,
      isSaving: false,
    }),
}));
