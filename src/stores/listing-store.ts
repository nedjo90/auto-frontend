import { create } from "zustand";
import type { ListingFieldState, FieldStatus } from "@auto/shared";
import type { CertifiedFieldResult } from "@auto/shared";

export interface ListingFormState {
  listingId: string | null;
  fields: Record<string, ListingFieldState>;
  visibilityScore: number;
  isLoading: boolean;

  setListingId: (id: string) => void;
  initializeFields: (certifiedFields: CertifiedFieldResult[]) => void;
  updateField: (fieldName: string, value: string | number | null, status: FieldStatus) => void;
  setFieldStatus: (fieldName: string, status: FieldStatus, certifiedSource?: string) => void;
  setVisibilityScore: (score: number) => void;
  setLoading: (loading: boolean) => void;
  getFieldState: (fieldName: string) => ListingFieldState | undefined;
  setOriginalCertifiedValue: (fieldName: string, originalValue: string) => void;
}

export const useListingStore = create<ListingFormState>((set, get) => ({
  listingId: null,
  fields: {},
  visibilityScore: 0,
  isLoading: false,

  setListingId: (id) => set({ listingId: id }),

  initializeFields: (certifiedFields) => {
    const fields: Record<string, ListingFieldState> = {};
    for (const cf of certifiedFields) {
      fields[cf.fieldName] = {
        fieldName: cf.fieldName,
        value: cf.fieldValue,
        status: cf.isCertified ? "certified" : "declared",
        certifiedSource: cf.source,
        certifiedTimestamp: cf.sourceTimestamp,
      };
    }
    set({ fields });
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

  setLoading: (loading) => set({ isLoading: loading }),

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
}));
