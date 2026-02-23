import { create } from "zustand";
import type { IConfigConsentType } from "@auto/shared";

interface ConsentState {
  pendingConsents: IConfigConsentType[];
  hasPendingConsents: boolean;
  setPendingConsents: (consents: IConfigConsentType[]) => void;
  clearPendingConsents: () => void;
}

export const useConsentStore = create<ConsentState>((set) => ({
  pendingConsents: [],
  hasPendingConsents: false,
  setPendingConsents: (consents) =>
    set({ pendingConsents: consents, hasPendingConsents: consents.length > 0 }),
  clearPendingConsents: () => set({ pendingConsents: [], hasPendingConsents: false }),
}));
