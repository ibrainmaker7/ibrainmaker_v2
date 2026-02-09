import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setProfile: (profile) => set({ profile }),

      setSession: (session) => set({ session }),

      setAuth: (user, profile, session) => set({
        user,
        profile,
        session,
        isAuthenticated: !!user
      }),

      clearAuth: () => set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false
      }),

      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null
      })),

      getRole: () => {
        const { profile } = get();
        return profile?.role || null;
      },

      getSubscriptionTier: () => {
        const { profile } = get();
        return profile?.subscription_tier || 'type_a';
      },

      getPreferredLanguage: () => {
        const { profile } = get();
        return profile?.preferred_language || 'en';
      },

      isTypeB: () => {
        const { profile } = get();
        return profile?.subscription_tier === 'type_b';
      },

      isTeacher: () => {
        const { profile } = get();
        return profile?.role === 'teacher';
      },

      isStudent: () => {
        const { profile } = get();
        return profile?.role === 'student';
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
