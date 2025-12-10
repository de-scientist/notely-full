import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NoteCard from "../components/NoteCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, FileText, Plus, AlertTriangle, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom"; // Assuming link to create new note

// Define the interface for a Note object (must match NoteCard's expectations)
interface Note {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  createdAt: string;
  isPublic?: boolean; 
  // Add other fields needed for filtering, e.g., type, author
}

// Rename component to better reflect its purpose
export default function NotesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all"); // 'all', 'public', 'private'

  // Fetch all notes (with appropriate generic typing)
  const { data: notes, isLoading, isError, error } = useQuery<Note[]>({
    queryKey: ["adminNotes"],
    queryFn: () => api.get("/admin/notes").then(res => res.data),
  });

  // ----------------------------------------------------
  // Filtering and Searching Logic
  // ----------------------------------------------------
  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    
    let filtered = notes;

    // 1. Status Filter
    if (filterStatus !== "all") {
      const targetPublic = filterStatus === "public";
      filtered = filtered.filter(note => (note.isPublic ?? false) === targetPublic);
    }

    // 2. Search Term Filter (case-insensitive search on title and synopsis)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(term) ||
          note.synopsis.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [notes, searchTerm, filterStatus]);


  // ----------------------------------------------------
  // UI States (Loading, Error)
  // ----------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-fuchsia-600" />
        <p className="ml-3 text-lg text-gray-600">Loading notes...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center"><AlertTriangle className="mr-2 h-5 w-5" /> Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Failed to load notes: {(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------
  // Main Render
  // ----------------------------------------------------
  return (
    <div className="p-6 space-y-6">
      
      {/* 1. Page Header and Controls */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
          <FileText className="mr-3 h-7 w-7 text-fuchsia-600" />
          Notes Management
        </h1>
        <Link to="/admin/notes/new">
            <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create New Note
            </Button>
        </Link>
      </div>

      <Separator />

      {/* 2. Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes by title or synopsis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Notes</SelectItem>
                    <SelectItem value="public">Public Only</SelectItem>
                    <SelectItem value="private">Private Only</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      
      {/* 3. Notes Grid */}
      <div className="pt-4">
        {filteredNotes.length === 0 && (
          <div className="text-center py-10">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              No notes found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {notes?.length === 0 
                ? "There are no notes in the system yet."
                : `No notes match your current filter and search criteria: "${searchTerm}"`
              }
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>
    </div>
  );
}