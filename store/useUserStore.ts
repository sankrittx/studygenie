import { create } from 'zustand';

export interface UserProfile {
    name: string;
    semester: string;
    courseName: string;
}

interface UserState {
    profile: UserProfile | null;
    hasCompletedOnboarding: boolean;
    setProfile: (profile: UserProfile) => void;
    updateProfile: (updates: Partial<UserProfile>) => void;
    reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    profile: null,
    hasCompletedOnboarding: false,

    setProfile: (profile) => set({
        profile,
        hasCompletedOnboarding: true
    }),

    updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null
    })),

    reset: () => set({
        profile: null,
        hasCompletedOnboarding: false
    })
}));
