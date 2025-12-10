import React from "react";

export default function NoteCard({ note }: { note: any }) {
  return (
    <div className="p-4 border rounded shadow hover:shadow-lg transition">
      <h2 className="font-bold text-lg">{note.title}</h2>
      <blockquote className="text-gray-500 italic">{note.synopsis}</blockquote>
      <div className="mt-2 text-sm">{note.content.slice(0, 150)}...</div>
    </div>
  );
}
