import { create } from "zustand";
import type { IAuthUser, IAuthState, Role } from "@auto/shared";

// Re-export for convenience
export type { IAuthUser };

interface AuthStoreState extends IAuthState {
  setUser: (user: IAuthUser, roles: Role[]) => void;
  clearUser: () => void;
  updateLastActivity: () => void;
  checkSessionTimeout: (timeoutMinutes: number) => boolean;
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

  checkSessionTimeout: (timeoutMinutes) => {
    const { isAuthenticated, lastActivity } = get();
    if (!isAuthenticated || lastActivity === 0) return false;
    const elapsed = Date.now() - lastActivity;
    return elapsed > timeoutMinutes * 60 * 1000;
  },
}));
