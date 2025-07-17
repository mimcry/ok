import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
  name: string;
  date_joined: string;
  zipCode: string;
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile_picture?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  user:any
}

interface AuthState {
  user: User | null;
  token: string | null;
  isSignedIn: boolean; // ✅ NEW STATE
  isHydrated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setIsHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isSignedIn: false, //  INITIAL VALUE
      isHydrated: false,

      setAuth: (token: string, user: User) => {
        set({ token, user, isSignedIn: true }); // SET TRUE ON LOGIN
      },

      logout: () => {
        set({ user: null, token: null, isSignedIn: false }); //  SET FALSE ON LOGOUT
      },

      setIsHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setIsHydrated(true);
        }
      },
    }
  )
);
