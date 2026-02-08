import { create } from "zustand";
import type { IAuthUser, IAuthState, RoleCode } from "@auto/shared";

// Re-export for convenience
export type { IAuthUser };

interface AuthStoreState extends IAuthState {
  setUser: (user: IAuthUser, roles: RoleCode[]) => void;
  clearUser: () => void;
  updateLastActivity: () => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  roles: [],
  isLoading: false,
  lastActivity: 0,

  setUser: (user, roles) =>
    set({
      user,
      isAuthenticated: true,
      roles,
      lastActivity: Date.now(),
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      roles: [],
      lastActivity: 0,
    }),

  updateLastActivity: () => set({ lastActivity: Date.now() }),
}));
