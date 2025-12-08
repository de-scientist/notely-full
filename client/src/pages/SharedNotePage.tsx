// SharedNotePage.tsx
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom'; 
import { useRef } from 'react'; 
import { api } from '../lib/api';
import { Loader2, NotebookPen, Lock, Tag, Calendar, Clock, Star, Download } from 'lucide-react';

// External Libraries for new features
import ReactMarkdown from 'react-markdown'; // 🎯 Markdown rendering
import jsPDF from 'jspdf'; // 🎯 PDF creation
import html2canvas from 'html2canvas'; // 🎯 HTML to Canvas conversion for PDF

// UI Components (assuming these are defined in your project)
import { Button } from "../components/ui/button"; 
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

// ❌ FIX APPLIED: The broken import './SharedNotePage.css' has been removed.

// Use standard hex for primary color to avoid oklch issue in html2canvas
const PRIMARY_HEX_COLOR = "#e879f9"; // fuchsia-400 equivalent for light mode
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
    user: { 
        firstName: string; 
        lastName: string; 
        username: string;
        avatar?: string;
    };
}

// Interface for the expected Backend Response
interface PublicEntryResponse {
    entry: SharedEntry; 
}

/**
 * Fetches and displays a public, read-only view of a note.
 */
export function SharedNotePage() {
    const { id } = useParams<{ id: string }>();

    // Ref to the element we want to convert to PDF
    const noteContentRef = useRef<HTMLDivElement>(null); 

    // 1. DATA FETCHING HOOK
    const { 
        data: entry, 
        isLoading, 
        isError, 
        error 
    } = useQuery<SharedEntry, Error>({
        queryKey: ['sharedEntry', id],
        queryFn: async (): Promise<SharedEntry> => {
            if (!id) throw new Error("Note ID is missing.");
            
            const response = await api.get<PublicEntryResponse>(`/public/entries/${id}`);
            
            if (!response.data.entry) {
                throw new Error("Invalid response structure from server.");
            }
            
            return response.data.entry; 
        },
        enabled: !!id, 
        retry: 1, 
    });

    // ----------------------------------------------------------------------
    // 🎯 PDF Download Handler
    // ----------------------------------------------------------------------
    const handleDownloadPdf = async () => {
        if (!entry || !noteContentRef.current) return;

        // Use the title for the filename
        const filename = `${entry.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        
        // Use html2canvas to capture the visual HTML structure
        const canvas = await html2canvas(noteContentRef.current, {
            scale: 2, 
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; 
        const pageHeight = 297; 
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0; 

        // Add the first page image
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Loop for multi-page documents
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(filename);
    };

    // ----------------------------------------------------------------------
    // 2. Loading State
    // ----------------------------------------------------------------------
    if (isLoading) {
        return (
            <div className="mt-16 flex justify-center">
                <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
            </div>
        );
    }

    // ----------------------------------------------------------------------
    // 3. Error State (404, etc.)
    // ----------------------------------------------------------------------
    if (isError || !entry) {
        const status = (error as any)?.response?.status;
        
        const errorMessage = status === 404
            ? "Note not found or link is invalid." 
            : "An error occurred while fetching the shared note."; 
            
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Lock className="h-12 w-12 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold dark:text-white mb-2">Error Viewing Note</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">{errorMessage}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                    Please check the URL or contact the owner.
                </p>
                <a href="/" className={`mt-6 ${PRIMARY_TEXT_CLASS} hover:underline`}>Go to Homepage</a>
            </div>
        );
    }
    
    // ----------------------------------------------------------------------
    // 4. Success Display
    // ----------------------------------------------------------------------
    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            
            {/* 🎯 FIX: Apply supported colors using standard CSS vars 
               This section provides fallback colors for html2canvas to read. */}
            <style jsx global>{`
                .pdf-capture-container {
                    /* --- Override fuchsia colors --- */
                    /* fuchsia-600 (used in PRIMARY_TEXT_CLASS, button) */
                    --color-fuchsia-600: #d946ef; 
                    /* fuchsia-500 (used in dark text/card border) */
                    --color-fuchsia-500: #a855f7; 
                    /* fuchsia-700 (used in button hover) */
                    --color-fuchsia-700: #c026d3;

                    /* --- Override gray/neutral colors if they use modern formats --- */
                    /* text-gray-600 */
                    --color-gray-600: #4b5563; 
                    /* dark:text-gray-400 */
                    --color-gray-400: #9ca3af; 
                    /* dark:bg-gray-800 */
                    --color-gray-800: #1f2937;
                    /* text-gray-500 */
                    --color-gray-500: #6b7280;
                }

                /* Ensure utility classes map to the supported colors within the container */
                .pdf-capture-container .text-fuchsia-600 { color: var(--color-fuchsia-600) !important; }
                .pdf-capture-container .dark\\:text-fuchsia-500 { color: var(--color-fuchsia-500) !important; }
                .pdf-capture-container .bg-fuchsia-600 { background-color: var(--color-fuchsia-600) !important; }
                .pdf-capture-container .hover\\:bg-fuchsia-700:hover { background-color: var(--color-fuchsia-700) !important; }
                /* Add more overrides as needed for other colored elements (borders, text, etc.) */
            `}</style>

            {/* 🎯 The target element for PDF generation, now with the fallback class */}
            <div ref={noteContentRef} className="bg-white dark:bg-gray-900 p-0 pdf-capture-container"> 
                
                <Card className="shadow-2xl dark:bg-gray-800 border-t-4 border-fuchsia-500 print:shadow-none">
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

                        {/* 🎯 Content: Now using react-markdown for rich text rendering */}
                        <div className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown>
                                {entry.content}
                            </ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            {/* Download Button (Placed outside the PDF reference div to prevent inclusion) */}
            <div className="flex justify-center mt-8">
                <Button 
                    onClick={handleDownloadPdf} 
                    // This button inherits the PDF safe colors from the style block above
                    className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-500 dark:hover:bg-fuchsia-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors"
                >
                    <Download className="h-5 w-5 mr-2" />
                    Download as PDF
                </Button>
            </div>
            
            <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500">
                <p>
                    This note is publicly shared by the author.
                    {/* Add author info if available */}
                    {entry.user && ` Authored by ${entry.user.firstName} ${entry.user.lastName} (${entry.user.username}).`}
                </p>
            </footer>
        </div>
    );
}