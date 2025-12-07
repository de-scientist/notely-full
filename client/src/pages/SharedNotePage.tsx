// SharedNotePage.tsx
import { useQuery } from '@tanstack/react-query';
import { useParams, Navigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Loader2, NotebookPen, Lock, Tag, Calendar, Clock, Star } from 'lucide-react';
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";

// Interface for the actual Entry object
interface SharedEntry {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    pinned?: boolean;
    isPublic: boolean;
    dateCreated: string;
    lastUpdated: string;
    category: { name: string };
    // Optionally include minimal author info if required, but usually omitted for security
}

// Interface for the expected Backend Response
interface PublicEntryResponse {
    entry: SharedEntry; // The entry is nested inside 'entry'
}

/**
 * Fetches and displays a public, read-only view of a note.
 */
export function SharedNotePage() {
    const { id } = useParams<{ id: string }>();

    // 1. DATA FETCHING HOOK
    // Use the SharedEntry interface for the type of the returned data ('entry')
    const { 
        data: entry, 
        isLoading, 
        isError, 
        error 
    } = useQuery<SharedEntry, Error>({
        queryKey: ['sharedEntry', id],
        queryFn: async (): Promise<SharedEntry> => {
            if (!id) throw new Error("Note ID is missing.");
            
            // 🎯 FIX APPLIED: Correctly access the nested 'entry' object
            const response = await api.get<PublicEntryResponse>(`/public/entries/${id}`);
            
            // Check for the nesting here: response.data is { entry: SharedEntry }
            if (!response.data.entry) {
                // Throw an error if the response structure is unexpected
                 throw new Error("Invalid response structure from server.");
            }
            
            return response.data.entry; 
        },
        enabled: !!id, // Only run the query if 'id' is present
        retry: 1, // Don't retry if the note is intentionally private (results in 404/403)
    });

    // 2. Loading State
    if (isLoading) {
        return (
            <div className="mt-16 flex justify-center">
                <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
            </div>
        );
    }

    // 3. Error State (e.g., 404 Not Found, 403 Private)
    if (isError || !entry) {
        // Since we are returning response.data.entry, entry will be null if the API call failed
        
        // This attempts to extract the status from the error object if it's an Axios error
        const status = (error as any)?.response?.status;
        
        const errorMessage = status === 404
            ? "Note not found or link is invalid." // Server returns 404 if private/deleted
            : "An error occurred while fetching the shared note."; 
            
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Lock className="h-12 w-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold dark:text-white mb-2">Error Viewing Note</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{errorMessage}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                    Please check the URL or contact the owner.
                </p>
                {/* Optionally add a link back to the homepage */}
                <a href="/" className={`mt-6 ${PRIMARY_TEXT_CLASS} hover:underline`}>Go to Homepage</a>
            </div>
        );
    }

    // 4. Final Data Check (The backend should prevent this, but it's fine)
    if (!entry.isPublic) {
        // This block should ideally not be hit if the backend is working correctly
        return <Navigate to="/access-denied" replace />; 
    }

    // 5. Success Display
    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <Card className="shadow-2xl dark:bg-gray-800 border-t-4 border-fuchsia-500">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                        <CardTitle className="text-3xl font-extrabold dark:text-white flex items-center gap-3">
                            <NotebookPen className={`h-7 w-7 ${PRIMARY_TEXT_CLASS}`} />
                            {entry.title}
                        </CardTitle>
                        {entry.pinned && (
                            <div className="text-yellow-500 flex items-center gap-1 opacity-70">
                                <Star className="h-5 w-5 fill-current" />
                                <span className="text-sm">Pinned</span>
                            </div>
                        )}
                    </div>
                    {entry.synopsis && (
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 italic border-l-4 pl-4 border-fuchsia-300 dark:border-fuchsia-700">
                            {entry.synopsis}
                        </p>
                    )}
                </CardHeader>
                
                <CardContent className="pt-6 border-t dark:border-gray-700">
                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                        <Badge variant="secondary" className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" /> {entry.category.name}
                        </Badge>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" /> Created: {new Date(entry.dateCreated).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> Updated: {new Date(entry.lastUpdated).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Content (Render as plain text or use a sanitizer/renderer if you support rich text like Markdown) */}
                    <div className="prose dark:prose-invert max-w-none break-words whitespace-pre-wrap">
                        {entry.content}
                    </div>
                </CardContent>
            </Card>

            <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500">
                <p>This note is publicly shared by the author.</p>
            </footer>
        </div>
    );
}