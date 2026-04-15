import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id:              string;
  email:           string;
  username:        string;
  displayName?:    string;
  avatarUrl?:      string;
  reputationScore?: number;
}

interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isAuthenticated: boolean;
  setAuth:  (user: User, accessToken: string, refreshToken: string) => void;
  logout:   () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken',  accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // 🔥 limpiar completamente antes de setear
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage'); // 🔥 clave con persist
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      updateUser: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user:            state.user,
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);