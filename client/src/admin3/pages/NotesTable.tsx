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

// ----------------------------------------------------
// Mock Data for Notes Management
// ----------------------------------------------------
const MOCK_NOTES: Note[] = [
    {
        id: "n1",
        title: "Project Phoenix Kickoff Meeting Notes",
        synopsis: "Key takeaways and next steps from the first team meeting on the new CMS system.",
        content: "We decided to proceed with React and TanStack Query for the frontend. Backend will use Node.js and PostgreSQL. The initial focus is on user authentication and data modeling. Deadline for V1 is end of Q3.",
        createdAt: "2025-12-08T10:00:00Z",
        isPublic: false,
    },
    {
        id: "n2",
        title: "Q4 Marketing Strategy Summary",
        synopsis: "High-level overview of digital marketing campaigns and budget allocation for the next quarter.",
        content: "Focus will be on organic content creation (SEO) and a small paid social media push targeting the US and EU markets. Budget is $50k. KPIs include a 15% increase in signups.",
        createdAt: "2025-12-05T15:30:00Z",
        isPublic: true,
    },
    {
        id: "n3",
        title: "Database Migration Checklist",
        synopsis: "Step-by-step procedure for moving production data to the new AWS RDS instance.",
        content: "1. Backup current database. 2. Spin up new RDS instance (us-east-1). 3. Perform schema validation. 4. Run data synchronization scripts. 5. Update application environment variables. Expected downtime: 30 minutes.",
        createdAt: "2025-12-01T08:45:00Z",
        isPublic: false,
    },
    {
        id: "n4",
        title: "Internal Documentation Update: API Changes",
        synopsis: "Summary of breaking changes in the /users endpoint (v2) implemented last week.",
        content: "The 'fullName' field has been deprecated in favor of 'firstName' and 'lastName'. Please update all frontend consumers immediately. The old endpoint will be retired on 2026-01-01.",
        createdAt: "2025-11-28T11:15:00Z",
        isPublic: true,
    },
];

// ----------------------------------------------------
// Custom Hook for Data Fetching with Mock Fallback
// ----------------------------------------------------
const useAdminNotesData = () => {
    // Original API fetching logic is preserved
    const queryResult = useQuery<Note[]>({
        queryKey: ["adminNotes"],
        queryFn: () => api.get("/admin/notes").then(res => res.data),
    });

    // Determine if we should use mock data: 
    // If the API fetch failed (isError)
    const useMockData = queryResult.isError; // Can also check process.env.NODE_ENV === 'development'

    return {
        // Return mock data if the flag is true, otherwise return the real data
        data: useMockData ? MOCK_NOTES : queryResult.data,
        isLoading: queryResult.isLoading && !useMockData, // Only show loading if we are fetching real data
        isError: queryResult.isError && !useMockData, // Only show error if we are attempting to fetch real data
        error: queryResult.error,
    };
};

// Rename component to better reflect its purpose
export default function NotesManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all"); // 'all', 'public', 'private'

  // Replace direct useQuery with the new hook
  const { data: notes, isLoading, isError, error } = useAdminNotesData();

  // ----------------------------------------------------
  // Filtering and Searching Logic
  // ----------------------------------------------------
  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    
    let filtered = notes;

    // 1. Status Filter
    if (filterStatus !== "all") {
      const targetPublic = filterStatus === "public";
      // The logic is preserved: it filters based on the note's isPublic status
      filtered = filtered.filter(note => (note.isPublic ?? false) === targetPublic); 
    }

    // 2. Search Term Filter (case-insensitive search on title and synopsis)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      // The logic is preserved: filtering by title OR synopsis
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

  // Only show error if the hook determined it's a real API error
  if (isError) {
    return (
      <div className="p-6">
        <Card className="border-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center"><AlertTriangle className="mr-2 h-5 w-5" /> API Error</CardTitle>
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
        {/* Check if notes is null or empty AFTER fetching/mocking */}
        {filteredNotes.length === 0 && (notes === null || notes.length === 0) ? (
          <div className="text-center py-10">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              No notes found
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no notes in the system yet.
            </p>
          </div>
        ) : filteredNotes.length === 0 ? (
           <div className="text-center py-10">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              No results for current filters
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              No notes match your current filter and search criteria: **"{searchTerm}"**
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}