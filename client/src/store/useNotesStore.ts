// store/useNotesStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useNotesStore = create(
  persist(
    (set) => ({
      notes: [],

      toggleBookmark: (id) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, isBookmarked: !n.isBookmarked } : n
          ),
        })),

      getBookmarked: () =>
        useNotesStore
          .getState()
          .notes.filter((n) => n.isBookmarked === true),
    }),
    {
      name: "notes-storage", // localStorage key
    }
  )
);
