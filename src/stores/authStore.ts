// // src/stores/authStore.ts

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import type { User, Wallet } from '@/types';
// import { authService } from '@/lib/api/services';

// interface AuthState {
//   user: User | null;
//   wallet: Wallet | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
// }

// interface AuthActions {
//   setUser: (user: User | null) => void;
//   setWallet: (wallet: Wallet | null) => void;
//   setToken: (token: string | null) => void;
//   login: (email: string, password: string) => Promise<void>;
//   register: (data: {
//     email: string;
//     phone: string;
//     password: string;
//     firstName: string;
//     lastName: string;
//   }) => Promise<void>;
//   logout: () => Promise<void>;
//   refreshProfile: () => Promise<void>;
//   clearError: () => void;
//   setLoading: (isLoading: boolean) => void;
// }

// type AuthStore = AuthState & AuthActions;

// export const useAuthStore = create<AuthStore>()(
//   persist(
//     (set, get) => ({
//       // Initial State
//       user: null,
//       wallet: null,
//       token: null,
//       isAuthenticated: false,
//       isLoading: false,
//       error: null,

//       // Actions
//       setUser: (user) => {
//         set({ user, isAuthenticated: !!user });
//       },

//       setWallet: (wallet) => {
//         set({ wallet });
//       },

//       setToken: (token) => {
//         set({ token, isAuthenticated: !!token });
//         if (typeof window !== 'undefined') {
//           if (token) {
//             localStorage.setItem('token', token);
//           } else {
//             localStorage.removeItem('token');
//           }
//         }
//       },

//       setLoading: (isLoading) => {
//         set({ isLoading });
//       },

//       clearError: () => {
//         set({ error: null });
//       },

//       login: async (email, password) => {
//         try {
//           set({ isLoading: true, error: null });
          
//           const response = await authService.login({ email, password });
          
//           set({
//             user: response.user,
//             wallet: response.wallet,
//             token: response.token,
//             isAuthenticated: true,
//             isLoading: false,
//           });

//           if (typeof window !== 'undefined') {
//             localStorage.setItem('token', response.token);
//           }
//         } catch (error) {
//           const errorMessage = error instanceof Error ? error.message : 'Login failed';
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       register: async (data) => {
//         try {
//           set({ isLoading: true, error: null });
          
//           const response = await authService.register(data);
          
//           set({
//             user: response.user,
//             wallet: response.wallet,
//             token: response.token,
//             isAuthenticated: true,
//             isLoading: false,
//           });

//           if (typeof window !== 'undefined') {
//             localStorage.setItem('token', response.token);
//           }
//         } catch (error) {
//           const errorMessage = error instanceof Error ? error.message : 'Registration failed';
//           set({ error: errorMessage, isLoading: false });
//           throw error;
//         }
//       },

//       logout: async () => {
//         try {
//           await authService.logout();
//         } catch (error) {
//           // Continue with logout even if API call fails
//           console.error('Logout error:', error);
//         } finally {
//           set({
//             user: null,
//             wallet: null,
//             token: null,
//             isAuthenticated: false,
//             error: null,
//           });

//           if (typeof window !== 'undefined') {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//           }
//         }
//       },

//       refreshProfile: async () => {
//         try {
//           const user = await authService.getProfile();
//           set({ user });
//         } catch (error) {
//           console.error('Failed to refresh profile:', error);
//           // If profile refresh fails due to auth, logout
//           if (error instanceof Error && error.message.includes('401')) {
//             get().logout();
//           }
//         }
//       },
//     }),
//     {
//       name: 'auth-storage',
//       partialize: (state) => ({
//         user: state.user,
//         wallet: state.wallet,
//         token: state.token,
//         isAuthenticated: state.isAuthenticated,
//       }),
//     }
//   )
// );



// src/stores/authStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Wallet } from '@/types';
import { authService } from '@/lib/api/services';

const AUTH_CHECK_COOLDOWN_MS = 60 * 1000;
let authCheckInFlight: Promise<void> | null = null;
let lastAuthCheckAt = 0;

interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setWallet: (wallet: Wallet | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setLoading: (isLoading: boolean) => void;
  setHydrated: (isHydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      wallet: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isHydrated: false,

      // Actions
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      setWallet: (wallet) => {
        set({ wallet });
      },

      setToken: (token) => {
        set({ token, isAuthenticated: !!token });
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('token', token);
          } else {
            localStorage.removeItem('token');
          }
        }
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      clearError: () => {
        set({ error: null });
      },

      setHydrated: (isHydrated) => {
        set({ isHydrated });
      },

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false, user: null, wallet: null });
          return;
        }

        const now = Date.now();
        const state = get();
        if (state.user && now - lastAuthCheckAt < AUTH_CHECK_COOLDOWN_MS) {
          return;
        }

        if (authCheckInFlight) {
          return authCheckInFlight;
        }

        authCheckInFlight = (async () => {
          try {
            // Verify token is still valid by fetching user profile
            const user = await authService.getProfile();
            set({ user, isAuthenticated: true });
          } catch (error) {
            console.error('Token validation failed:', error);
            const message = error instanceof Error ? error.message.toLowerCase() : '';
            const isUnauthorized =
              message.includes('401') ||
              message.includes('unauthorized') ||
              message.includes('invalid token') ||
              message.includes('token expired');

            // Only clear auth state on explicit unauthorized responses.
            if (isUnauthorized) {
              set({
                user: null,
                wallet: null,
                token: null,
                isAuthenticated: false,
              });

              if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
              }
              return;
            }

            // Keep existing session on transient API/network errors.
            set({ isAuthenticated: true });
          } finally {
            lastAuthCheckAt = Date.now();
            authCheckInFlight = null;
          }
        })();

        return authCheckInFlight;
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login({ email, password });
          
          set({
            user: response.user,
            wallet: response.wallet,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.register(data);
          
          set({
            user: response.user,
            wallet: response.wallet,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('token', response.token);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            wallet: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });

          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },

      refreshProfile: async () => {
        try {
          const user = await authService.getProfile();
          set({ user });
        } catch (error) {
          console.error('Failed to refresh profile:', error);
          const message = error instanceof Error ? error.message.toLowerCase() : '';
          const isUnauthorized =
            message.includes('401') ||
            message.includes('unauthorized') ||
            message.includes('invalid token') ||
            message.includes('token expired');

          // If profile refresh fails due to auth, logout.
          if (isUnauthorized) {
            get().logout();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        wallet: state.wallet,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Set hydrated flag once rehydration is complete
        if (typeof window !== 'undefined' && state?.token) {
          localStorage.setItem('token', state.token);
        }
        state?.setHydrated(true);
      },
    }
  )
);
