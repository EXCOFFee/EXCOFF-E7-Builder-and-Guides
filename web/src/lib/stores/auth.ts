import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    // Actions
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

/**
 * Authentication store using Zustand with persistence.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (user, token) => {
                localStorage.setItem('auth_token', token);
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'e7hub-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
