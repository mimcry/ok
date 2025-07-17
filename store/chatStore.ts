import { create } from 'zustand';

interface ChatUser {
  id: number ; // Changed from string to number to match your component usage
  username: string; // Changed from 'name' to 'username' to match component
  profile_picture?: string; // Made optional since it might be null/undefined
  // Add other fields that might be used in your component
  full_name?: string;
  online?: boolean;
  partner:{
    phone_number:string;
  }
}

interface ChatState {
  selectedUser: ChatUser | null;
  setSelectedUser: (user: ChatUser) => void;
  clearSelectedUser: () => void;
}

const useChatStore = create<ChatState>((set) => ({
  selectedUser: null,
  setSelectedUser: (user) => set({ selectedUser: user }),
  clearSelectedUser: () => set({ selectedUser: null }),
}));

export default useChatStore;