// app/saved/page.tsx
"use client";

import { useNotesStore } from "@/store/useNotesStore";
import NoteCard from "@/components/NoteCard";

export default function SavedNotes() {
  const bookmarked = useNotesStore((s) => s.getBookmarked());

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Saved Notes</h1>

      {bookmarked.length === 0 ? (
        <p className="opacity-60">No saved notes yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {bookmarked.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
