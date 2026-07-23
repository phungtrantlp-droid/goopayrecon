import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
  canEdit: () => boolean;
  canExport: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      hasRole: (...roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },
      canEdit: () => {
        const { user } = get();
        if (!user) return false;
        return [Role.ADMIN, Role.EDITOR].includes(user.role);
      },
      canExport: () => {
        const { user } = get();
        if (!user) return false;
        return [Role.ADMIN, Role.EDITOR].includes(user.role);
      },
      isAdmin: () => {
        const { user } = get();
        if (!user) return false;
        return user.role === Role.ADMIN;
      }
    }),
    {
      name: 'goopayrecon-auth',
    }
  )
);
