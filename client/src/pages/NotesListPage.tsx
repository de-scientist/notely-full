// NotesListPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "../components/ui/card";
import { Badge } from '../components/ui/badge';
import { toast } from "sonner";
import {
    Loader2,
    Tag,
    ArrowRight,
    PlusCircle,
    Star,
    StarOff,
    Search,
    Trash2,
    Edit,
    Share2,
    Bookmark,
    Lock,
    NotebookPen,
    ThumbsUp,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState, useEffect, useMemo } from 'react'; 

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const SOLID_BUTTON_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-md shadow-fuchsia-500/50";
const CTA_BUTTON_CLASS = "bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg px-4 py-2 shadow-md shadow-fuchsia-400/40 transition transform hover:scale-[1.03]";

interface Entry {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    isDeleted: boolean;
    pinned: boolean;
    bookmarked?: boolean; // Ensure this is consistently handled by the backend API response
    isPublic?: boolean;
    // ⭐ FIX 1: Renamed fields to match Prisma's output keys
    createdAt: string; 
    updatedAt: string; 
    category: { name: string };
}

/**
 * Helper function to format a date string into a relative time string.
 */
function formatRelativeTime(dateString: string): string {
    // FIX: Using Date.parse() or new Date(string) is usually sufficient if the string is ISO 8601 compliant.
    // The previous implementation was likely correct, but checking the validity is safer.
    const date = new Date(dateString);
    const now = new Date();
    
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (seconds < 60) {
        return "just now";
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return formatter.format(-minutes, 'minute');
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return formatter.format(-hours, 'hour');
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return formatter.format(-days, 'day');
    }
    
    return `on ${date.toLocaleDateString()}`;
}

// Reusable Note Card Component
interface NoteCardProps {
    entry: Entry;
    isDragging?: boolean;
    draggableProps?: any;
    dragHandleProps?: any;
    innerRef?: React.Ref<HTMLDivElement>;
    onDelete: (id: string) => void;
    onTogglePin: (id: string, pinned: boolean) => void;
    onToggleBookmark: (id: string, bookmarked: boolean) => void;
    onShare: (entry: Entry) => Promise<void>;
    onTogglePublic?: (id: string, isPublic: boolean) => void;
    simple?: boolean;
}

function NoteCard({
    entry,
    isDragging = false,
    draggableProps,
    dragHandleProps,
    innerRef,
    onDelete,
    onTogglePin,
    onToggleBookmark,
    onShare,
    onTogglePublic,
    simple = false
}: NoteCardProps) {
    const isPinned = !!entry.pinned;
    const isBookmarked = !!entry.bookmarked;
    const isPublic = !!entry.isPublic;
    
    // ⭐ FIX 2: Use entry.updatedAt instead of entry.lastUpdated
    const relativeTime = formatRelativeTime(entry.updatedAt);

    return (
        <Card
            ref={innerRef}
            {...draggableProps}
            {...dragHandleProps}
            className={`
                relative group flex flex-col justify-between shadow-lg dark:bg-gray-800 transition-all duration-200
                ${isDragging ? 'scale-[1.03] shadow-xl z-10 border-fuchsia-500' : 'hover:scale-[1.01]'}
                ${isPinned && !simple ? 'border-2 border-fuchsia-500 ring-4 ring-fuchsia-200 dark:ring-fuchsia-900' : 'border border-gray-200 dark:border-gray-700'}
                ${simple ? 'w-64 flex-shrink-0' : ''}
            `}
        >
            {/* PINNED LABEL */}
            {isPinned && !simple && (
                <div className="absolute top-0 right-0 transform translate-y-[-50%] translate-x-[20%] rotate-3 px-3 py-1 text-xs font-bold bg-yellow-500 text-white rounded-full shadow-lg">
                    PINNED
                </div>
            )}

            <CardHeader className={`pb-2 ${simple ? 'p-3' : 'p-4'}`}>
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {/* Bookmark Icon Button (FIX: Ensure onClick is correct) */}
                            <button
                                // The toggle function is correct: use the current bookmarked state's inverse
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card read link if this was a wrapper
                                    onToggleBookmark(entry.id, !isBookmarked);
                                }}
                                title={isBookmarked ? "Remove from Saved" : "Save for later"}
                                className={`
                                    p-1 rounded-full hover:scale-105 transform transition-all duration-150
                                    ${isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500'}
                                `}
                            >
                                <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                            </button>
                            <CardTitle className={`line-clamp-2 ${simple ? 'text-lg' : 'text-xl'} dark:text-white`}>
                                {entry.title}
                            </CardTitle>
                        </div>
                        
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                            <Badge
                                variant="secondary"
                                className={`w-fit text-xs ${PRIMARY_TEXT_CLASS} border-fuchsia-600 dark:border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/30`}
                            >
                                <Tag className="h-3 w-3 mr-1" /> {entry.category.name}
                            </Badge>
                            {/* Public Status Badge */}
                            {isPublic && (
                                <span className="text-xs rounded px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 font-medium">
                                    Public
                                </span>
                            )}
                            {/* Saved Badge */}
                            {isBookmarked && (
                                <span className="text-xs rounded px-2 py-0.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700 font-medium">
                                    Saved
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-1">
                        {/* Pin toggle */}
                        <Button
                            size="sm"
                            variant="ghost"
                            title={isPinned ? "Unpin Note" : "Pin Note"}
                            onClick={(e) => {
                                e.stopPropagation();
                                onTogglePin(entry.id, !isPinned);
                            }}
                            className={`p-1 h-8 w-8 ${isPinned ? 'text-yellow-500 hover:bg-yellow-100/30 dark:hover:bg-yellow-900/50' : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                        >
                            {isPinned ? <Star className="h-5 w-5" fill="currentColor" /> : <StarOff className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className={`pt-0 ${simple ? 'p-3' : 'p-4'}`}>
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {entry.synopsis || entry.content.slice(0, 120) + (entry.content.length > 120 ? '...' : '')}
                </p>
            </CardContent>

            <CardFooter className={`flex items-center justify-between pt-4 border-t dark:border-gray-700 ${simple ? 'p-3' : 'p-4'}`}>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                    Updated {relativeTime}
                </span>

                <div className="flex gap-2 items-center flex-wrap justify-end">
                    
                    {/* Public/Private Toggle Button */}
                    {onTogglePublic && (
                        <Button
                            size="sm"
                            variant="ghost"
                            title={isPublic ? "Make Private" : "Make Public"}
                            onClick={(e) => {
                                e.stopPropagation();
                                onTogglePublic(entry.id, !isPublic);
                            }}
                            className={`p-2 h-8 w-8 transition-colors duration-150 rounded-full ${
                                isPublic ? 'text-green-500 hover:bg-green-100/30 dark:hover:bg-green-900/50' : 'text-gray-400 dark:text-gray-500 hover:text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`}
                        >
                            {isPublic ? (
                                <Share2 className="h-4 w-4" />
                            ) : (
                                <Lock className="h-4 w-4" />
                            )}
                        </Button>
                    )}

                    {/* Edit */}
                    <Link to={`/app/notes/${entry.id}/edit`} title="Edit" onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="outline" className="p-2 h-8 w-8 rounded-full hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 border-fuchsia-200 dark:border-fuchsia-700 text-fuchsia-600 dark:text-fuchsia-500">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>

                    {/* Share Button (Calls handleShare for Web Share API) */}
                    <Button
                        size="sm"
                        variant="ghost"
                        title={isPublic ? "Share Note (via Web Share API)" : "Note is private. Make public to share."}
                        onClick={(e) => {
                            e.stopPropagation();
                            onShare(entry);
                        }}
                        disabled={!isPublic}
                        className={`p-2 h-8 w-8 rounded-full transition-colors duration-150 ${
                            isPublic 
                                ? 'text-fuchsia-600 dark:text-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/30' 
                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                        size="sm"
                        variant="destructive"
                        title="Delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(entry.id);
                        }}
                        className="p-2 h-8 w-8 rounded-full"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Read */}
                    <Link to={`/app/notes/${entry.id}`} onClick={e => e.stopPropagation()}>
                        <Button size="sm" className={`${SOLID_BUTTON_CLASS} p-2 h-8 w-8 rounded-full`} title="Read full note">
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}

// Main Component
export function NotesListPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // 1. DATA FETCHING HOOK
    const { data, isLoading } = useQuery({
        queryKey: ['entries'],
        queryFn: async (): Promise<{ entries: Entry[] }> => (await api.get('/entries')).data,
    });

    // 2. STATE HOOKS
    const [entries, setEntries] = useState<Entry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOption, setSortOption] = useState('recent'); // Default to recent
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    // 3. EFFECT HOOK
    useEffect(() => {
        // Initial sorting when data is fetched: Sort by Pinned then by updatedAt
        if (data?.entries) {
            setEntries(
                [...data.entries].sort((a, b) => {
                    // Pinned notes first
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
                    // Then by recent update
                    // ⭐ FIX 3: Use entry.updatedAt
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                })
            );
        }
    }, [data]);

    // 4. MUTATION HOOKS
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/entries/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            toast.success("Note moved to trash.");
        },
        onError: () => toast.error("Failed to delete note."),
    });

    const togglePinMutation = useMutation({
        mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) =>
            await api.patch(`/entries/${id}`, { pinned }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            toast.info(variables.pinned ? "Note pinned!" : "Note unpinned.");
        },
        onError: () => toast.error("Failed to toggle pin status."),
    });

    // FIX: This mutation logic looks correct. It hits a dedicated endpoint for bookmarking.
    const toggleBookmarkMutation = useMutation({
        mutationFn: async ({ id, bookmarked }: { id: string; bookmarked: boolean }) => {
            if (bookmarked) {
                // To bookmark/save
                return await api.post(`/entries/${id}/bookmark`);
            } else {
                // To unbookmark/remove from saved
                return await api.delete(`/entries/${id}/bookmark`);
            }
        },
        onSuccess: (_, variables) => {
            // Invalidate to force refetch and update the bookmark icon/filter status
            queryClient.invalidateQueries({ queryKey: ['entries'] }); 
            toast.success(variables.bookmarked ? "Note saved successfully!" : "Note removed from saved.");
        },
        onError: () => toast.error("Failed to toggle bookmark status."),
    });

    const togglePublicMutation = useMutation({
        mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) =>
            await api.patch(`/entries/${id}`, { isPublic }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            toast.success(`Note set to ${variables.isPublic ? 'Public' : 'Private'}.`);
        },
        onError: () => toast.error("Failed to change sharing status."),
    });

    // --- NON-HOOK FUNCTION ---
    const onDragEnd = (result: DropResult) => {
        // Only allow drag-and-drop when sorting by 'recent' (or default)
        if (!result.destination || sortOption !== 'recent') return; 
        
        const updated = Array.from(entries);
        const [moved] = updated.splice(result.source.index, 1);
        updated.splice(result.destination.index, 0, moved);
        setEntries(updated);
        // NOTE: A real app would send a mutation here to save the new order.
    };

    // --- DERIVED STATE ---
    const allBookmarkedNotes = useMemo(() => entries.filter(e => e.bookmarked), [entries]);
    
    const filteredEntries = useMemo(() => {
        let filtered = entries.filter(entry => {
            if (entry.isDeleted) return false;
            // Filter by Saved Only
            if (showSavedOnly && !entry.bookmarked) return false;
            // Filter by Category
            if (selectedCategory !== 'All' && entry.category.name !== selectedCategory) return false;
            // Filter by Search Query
            const q = searchQuery.trim().toLowerCase();
            if (!q) return true;
            
            return (
                entry.title.toLowerCase().includes(q) ||
                entry.synopsis.toLowerCase().includes(q) ||
                entry.content.toLowerCase().includes(q) ||
                entry.category.name.toLowerCase().includes(q)
            );
        });

        // Apply sorting
        filtered = filtered.sort((a, b) => {
            if (sortOption === 'alphabetical') {
                return a.title.localeCompare(b.title);
            }
            
            // Default/Recent sort: Pinned first, then by Last Updated
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            
            // ⭐ FIX 4: Use entry.updatedAt
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });

        return filtered;
    }, [entries, showSavedOnly, selectedCategory, searchQuery, sortOption]);

    const displayNotes = filteredEntries;
    
    const recentNotes = useMemo(() => 
        // ⭐ FIX 5: Use entry.updatedAt
        [...entries].filter(e => !e.isDeleted).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 3)
    , [entries]);

    const categories = ['All', ...Array.from(new Set(entries.map(e => e.category.name)))];

    // --- CONDITIONAL RENDER START ---
    if (isLoading) return (
        <div className="mt-16 flex justify-center">
            <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
        </div>
    );
    // --- CONDITIONAL RENDER END ---

    // FIX: Enhanced Share function logic using Web Share API
    const handleShare = async (entry: Entry) => {
        if (!entry.isPublic) {
            toast.info("Note must be public to share. Please use the lock icon to make it public first.");
            return;
        }

        try {
            const shareUrl = `${window.location.origin}/share/${entry.id}`;
            const shareData: ShareData = {
                title: entry.title,
                text: entry.synopsis || `Check out this note: ${entry.title}`,
                url: shareUrl,
            };
            
            // Attempt to use the Web Share API (gives WhatsApp, FB, IG options etc.)
            if (navigator.share) {
                await navigator.share(shareData);
                toast.success('Note shared successfully via native menu!');
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                // Fallback to clipboard copy
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Share link copied to clipboard!');
            } else {
                // Last resort: prompt
                window.prompt('Copy this share link', shareUrl);
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                 // User dismissed the share dialog
                return;
            }
            toast.error('Unable to share or copy link.');
            console.error('Share error:', err);
        }
    };

    // Helper for passing togglePublic handler to NoteCard
    const handleTogglePublic = (id: string, isPublic: boolean) => {
        togglePublicMutation.mutate({ id, isPublic });
    }

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
                    <NotebookPen className={`h-8 w-8 ${PRIMARY_TEXT_CLASS}`} /> My Notes
                </h1>
                <Button className={`${CTA_BUTTON_CLASS} flex items-center gap-2`} onClick={() => navigate('/app/notes/new')}>
                    <PlusCircle className="h-5 w-5" /> Create New Note
                </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 p-4 border border-fuchsia-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex-wrap shadow-inner">
                <div className="px-4 py-2 rounded-lg shadow-sm border border-fuchsia-200 dark:border-fuchsia-900/50 bg-white dark:bg-gray-900/20 flex-1 min-w-[120px]">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Notes</p>
                    <p className={`text-xl font-bold ${PRIMARY_TEXT_CLASS}`}>{entries.length}</p>
                </div>
                <div className="px-4 py-2 rounded-lg shadow-sm border border-fuchsia-200 dark:border-fuchsia-900/50 bg-white dark:bg-gray-900/20 flex-1 min-w-[120px]">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Pinned Notes</p>
                    <p className={`text-xl font-bold ${PRIMARY_TEXT_CLASS}`}>{entries.filter(e => e.pinned).length}</p>
                </div>
                <div className="px-4 py-2 rounded-lg shadow-sm border border-fuchsia-200 dark:border-fuchsia-900/50 bg-white dark:bg-gray-900/20 flex-1 min-w-[120px]">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Saved</p>
                    <p className={`text-xl font-bold ${PRIMARY_TEXT_CLASS}`}>{allBookmarkedNotes.length}</p> 
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-center w-full p-4 border border-fuchsia-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="relative flex-1 min-w-40 max-w-lg w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search titles, content, or categories..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <select
                    aria-label="Filter by category"
                    className="w-full md:w-auto rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition shadow-sm"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <select
                    aria-label="Sort notes"
                    className="w-full md:w-auto rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition shadow-sm"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="recent">Recently Updated</option>
                    <option value="alphabetical">A-Z</option>
                </select>

                <label className="inline-flex items-center gap-2 text-sm md:ml-auto whitespace-nowrap">
                    <input
                        type="checkbox"
                        checked={showSavedOnly}
                        onChange={() => setShowSavedOnly(s => !s)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-fuchsia-600 dark:text-fuchsia-500 focus:ring-fuchsia-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Show Saved Only</span>
                </label>
            </div>
            
            <hr className="border-fuchsia-300/50 dark:border-fuchsia-900/50" />

            {/* Recently Updated (top 3) */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 shadow-inner">
                <h2 className="text-xl font-semibold dark:text-white mb-3 border-b pb-2 border-fuchsia-500/50 flex items-center gap-2">
                    <ThumbsUp className='h-5 w-5 text-fuchsia-500' /> Recent Activity
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-fuchsia-400/50 scrollbar-track-gray-200/50">
                    {recentNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            entry={note}
                            onDelete={(id) => deleteMutation.mutate(id)}
                            onTogglePin={(id, pinned) => togglePinMutation.mutate({ id, pinned })}
                            onToggleBookmark={(id, bookmarked) => toggleBookmarkMutation.mutate({ id, bookmarked })}
                            onShare={handleShare}
                            onTogglePublic={handleTogglePublic}
                            simple
                        />
                    ))}
                    {!recentNotes.length && (
                             <p className="text-sm text-gray-500 dark:text-gray-400 py-2">No recent notes found.</p>
                    )}
                </div>
            </div>

            <hr className="border-fuchsia-300/50 dark:border-fuchsia-900/50" />

            {/* Main Note Grid */}
            <h2 className="text-xl font-semibold dark:text-white mb-4">
                {showSavedOnly ? `💾 Saved Notes (${displayNotes.length})` : `All Notes (${displayNotes.length})`}
            </h2>

            {!displayNotes.length ? (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    {showSavedOnly ? 'No saved notes match your filters.' : 'No notes match your current filters.'}
                </div>
            ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="notes-grid">
                        {(provided) => (
                            <div 
                                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" 
                                {...provided.droppableProps} 
                                ref={provided.innerRef}
                            >
                                {displayNotes.map((entry, index) => (
                                    // Disable Draggable if not sorting by 'recent'
                                    <Draggable 
                                        key={entry.id} 
                                        draggableId={entry.id} 
                                        index={index} 
                                        isDragDisabled={sortOption !== 'recent'}
                                    >
                                        {(provided, snapshot) => (
                                            <NoteCard
                                                entry={entry}
                                                isDragging={snapshot.isDragging}
                                                draggableProps={provided.draggableProps}
                                                // Only provide drag handle props if dragging is enabled (sort is 'recent')
                                                dragHandleProps={sortOption === 'recent' ? provided.dragHandleProps : null} 
                                                innerRef={provided.innerRef}
                                                onDelete={(id) => deleteMutation.mutate(id)}
                                                onTogglePin={(id, pinned) => togglePinMutation.mutate({ id, pinned })}
                                                onToggleBookmark={(id, bookmarked) => toggleBookmarkMutation.mutate({ id, bookmarked })}
                                                onShare={handleShare}
                                                onTogglePublic={handleTogglePublic}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
}