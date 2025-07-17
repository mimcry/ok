// store/userStore.ts
import { create } from 'zustand';

// Define the UserInfo interface to match your profile data structure
interface UserInfo {
  name: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  email: string;
  phone: string | number;
  memberSince: string;
  completedJobs: number;
  rating: number;
  profileImage: string;
  coverImage: string;
  country: string;
  date_joined?: Date;
}

// Define the store interface
interface UserState {
  userInfo: UserInfo;
  setUserInfo: (info: Partial<UserInfo>) => void;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  clearUserInfo: () => void;
}

// Create the default/initial state
const defaultUserInfo: UserInfo = {
  name: "",
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  email: "",
  phone: "",
  memberSince: "",
  completedJobs: 0,
  rating: 0,
  profileImage: "",
  coverImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  country: "",
};

// Create and export the store
export const useUserStore = create<UserState>((set) => ({
  userInfo: defaultUserInfo,
  
  // Set the entire user info object (replaces all fields)
  setUserInfo: (info) => set({ userInfo: { ...defaultUserInfo, ...info } }),
  
  // Update specific fields while keeping others intact
  updateUserInfo: (info) => set((state) => ({
    userInfo: { ...state.userInfo, ...info }
  })),
  
  // Reset to default state
  clearUserInfo: () => set({ userInfo: defaultUserInfo }),
}));

interface Host {
  profile_picture: string | undefined;
  id: number;
  full_name: string;
  email: string;
  profile_image?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

interface NavigationState {
  selectedHostForModal: Host | null;
  shouldOpenHostModal: boolean;
  setSelectedHostForModal: (host: Host | null) => void;
  setShouldOpenHostModal: (should: boolean) => void;
  clearNavigationState: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  selectedHostForModal: null,
  shouldOpenHostModal: false,
  
  setSelectedHostForModal: (host) => set({ selectedHostForModal: host }),
  setShouldOpenHostModal: (should) => set({ shouldOpenHostModal: should }),
  
  clearNavigationState: () => set({ 
    selectedHostForModal: null, 
    shouldOpenHostModal: false 
  }),
}));