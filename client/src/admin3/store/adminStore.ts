import { create } from "zustand";

interface AdminState {
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  filter: string;
  setFilter: (val: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  selectedUserId: null,
  setSelectedUserId: (id) => set({ selectedUserId: id }),
  filter: "",
  setFilter: (val) => set({ filter: val }),
}));
