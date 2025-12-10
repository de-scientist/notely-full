import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NoteCard from "../components/NoteCard";

export default function NotesTable() {
  const { data: notes } = useQuery(["notes"], () => api.get("/notes").then(res => res.data));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes?.map((note: any) => <NoteCard key={note.id} note={note} />)}
      </div>
    </div>
  );
}
