import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  roles: string[];
  isLoading: boolean;
  lastActivity: number;
  setUser: (user: AuthUser, roles: string[]) => void;
  clearUser: () => void;
  updateLastActivity: () => void;
  checkSessionTimeout: (timeoutMinutes: number) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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

  updateLastActivity: () =>
    set({ lastActivity: Date.now() }),

  checkSessionTimeout: (timeoutMinutes) => {
    const { isAuthenticated, lastActivity } = get();
    if (!isAuthenticated || lastActivity === 0) return false;
    const elapsed = Date.now() - lastActivity;
    return elapsed > timeoutMinutes * 60 * 1000;
  },
}));
