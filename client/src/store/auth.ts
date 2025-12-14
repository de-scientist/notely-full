import { create } from "zustand";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;

  // Setters
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;

  // Clear everything
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,

  // Keep your existing functionality exactly as it was
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),

  // Enhanced clear: wipes user + token + resets loading
  clear: () => set({ user: null, token: null, loading: false }),
}));
