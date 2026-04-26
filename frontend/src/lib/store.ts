/**
 * Auth Store — Zustand global state for authentication
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, authApi, userApi, setTokens, clearTokens } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await authApi.login(email, password);
          setTokens(data.access_token, data.refresh_token);
          await get().fetchMe();
          set({ isAuthenticated: true });
        } catch (err: any) {
          set({ error: err?.response?.data?.detail || "Login failed. Please check your credentials." });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try { await authApi.logout(); } catch {}
        clearTokens();
        set({ user: null, isAuthenticated: false });
        window.location.href = "/auth/login";
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await userApi.getMe();
          set({ user: data, isAuthenticated: true });
        } catch {
          clearTokens();
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isLoading: false });
        }
      },

      updateUser: (data) =>
        set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),

      clearError: () => set({ error: null }),
    }),
    {
      name: "si-auth",
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
