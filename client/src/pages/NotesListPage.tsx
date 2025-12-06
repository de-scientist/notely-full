// NotesListPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from '../components/ui/badge';
import { toast } from "sonner"; // 💡 UX Improvement: Import toast for feedback
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
    NotebookPen
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState, useEffect } from 'react';

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
    bookmarked?: boolean;
    isPublic?: boolean;
    dateCreated: string;
    lastUpdated: string;
    category: { name: string };
}

// Reusable Note Card Component (unchanged props/structure)
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

    return (
        <Card
            ref={innerRef}
            {...draggableProps}
            {...dragHandleProps}
            className={`
                relative group flex flex-col justify-between shadow-lg dark:bg-gray-800 transition-all duration-200
                ${isDragging ? 'scale-[1.03] shadow-xl z-10 border-fuchsia-500' : 'hover:scale-[1.01]'}
                ${isPinned && !simple ? 'border-2 border-fuchsia-500' : 'border border-gray-200 dark:border-gray-700'}
                ${simple ? 'w-64 flex-shrink-0' : ''}
            `}
        >
            {/* Top-right bookmark button */}
            <div className="absolute top-3 right-3 z-20">
                <button
                    onClick={() => onToggleBookmark(entry.id, !isBookmarked)}
                    title={isBookmarked ? "Remove from Saved" : "Save for later"}
                    className={`
                        p-2 rounded-full bg-white/90 dark:bg-gray-900/80 backdrop-blur-md shadow-sm
                        hover:scale-105 transform transition-all duration-150
                        flex items-center justify-center
                        ${isBookmarked ? 'ring-2 ring-fuchsia-300 dark:ring-fuchsia-700' : 'opacity-90'}
                    `}
                >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`} />
                </button>
            </div>

            <CardHeader className={`pb-2 ${simple ? 'p-3' : 'p-4'}`}>
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <CardTitle className={`line-clamp-2 ${simple ? 'text-lg' : 'text-xl'} dark:text-white`}>
                            {entry.title}
                        </CardTitle>
                        <div className="mt-2 flex items-center gap-2">
                            <Badge
                                variant="secondary"
                                className={`w-fit text-xs ${PRIMARY_TEXT_CLASS} border-fuchsia-600 dark:border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/30`}
                            >
                                <Tag className="h-3 w-3 mr-1" /> {entry.category.name}
                            </Badge>
                            {isPublic && (
                                <span className="text-xs rounded px-2 py-0.5 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-700">
                                    Public
                                </span>
                            )}
                            {isBookmarked && (
                                <span className="text-xs rounded px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
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
                            onClick={() => onTogglePin(entry.id, !isPinned)}
                            className={`p-1 h-8 w-8 ${isPinned ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500'}`}
                        >
                            {isPinned ? <Star className="h-5 w-5" /> : <StarOff className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className={`pt-0 ${simple ? 'p-3' : 'p-4'}`}>
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {entry.synopsis || entry.content.slice(0, 120) + (entry.content.length > 120 ? '...' : '')}
                </p>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-4 border-t dark:border-gray-700 p-4 space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Updated {new Date(entry.lastUpdated).toLocaleDateString()}
                </span>

                <div className="flex gap-2 items-center">
                    {/* Edit */}
                    <Link to={`/app/notes/${entry.id}/edit`} title="Edit">
                        <Button size="sm" variant="outline" className="p-2 h-8 w-8">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>

                    {/* Share - will copy share URL if public, or toggle public then copy */}
                    <Button
                        size="sm"
                        variant="ghost"
                        title="Share note"
                        onClick={() => onShare(entry)}
                        className={`p-2 h-8 w-8 ${isPublic ? 'text-fuchsia-600' : 'text-gray-400 dark:text-gray-500'}`}
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>

                    {/* Delete */}
                    <Button 
                        size="sm" 
                        variant="destructive" 
                        title="Delete" 
                        onClick={() => onDelete(entry.id)} 
                        className="p-2 h-8 w-8"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Read */}
                    <Link to={`/app/notes/${entry.id}`}>
                        <Button size="sm" className={SOLID_BUTTON_CLASS} title="Read full note">
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

    const { data, isLoading } = useQuery({
        queryKey: ['entries'],
        queryFn: async (): Promise<{ entries: Entry[] }> => (await api.get('/entries')).data,
    });

    const [entries, setEntries] = useState<Entry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOption, setSortOption] = useState('recent');
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    useEffect(() => {
        if (data?.entries) setEntries(data.entries);
    }, [data]);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/entries/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            toast.success("Note moved to trash."); // 💡 UX Improvement
        },
        onError: () => toast.error("Failed to delete note."), // 💡 UX Improvement
    });

    const togglePinMutation = useMutation({
        mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) =>
            await api.patch(`/entries/${id}`, { pinned }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            toast.info(variables.pinned ? "Note pinned!" : "Note unpinned."); // 💡 UX Improvement
        },
        onError: () => toast.error("Failed to toggle pin status."), // 💡 UX Improvement
    });

    // 🎯 FIX AND UX IMPROVEMENT: Updated to use POST/DELETE endpoints
    const toggleBookmarkMutation = useMutation({
        mutationFn: async ({ id, bookmarked }: { id: string; bookmarked: boolean }) => {
            if (bookmarked) {
                // Server POST /api/entry/:id/bookmark to save
                return await api.post(`/entries/${id}/bookmark`);
            } else {
                // Server DELETE /api/entry/:id/bookmark to unsave
                return await api.delete(`/entries/${id}/bookmark`);
            }
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            toast.success(variables.bookmarked ? "Note saved to bookmarks!" : "Bookmark removed."); // 💡 UX Improvement
        },
        onError: () => toast.error("Failed to toggle bookmark status."), // 💡 UX Improvement
    });

    const togglePublicMutation = useMutation({
        mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) =>
            await api.patch(`/entries/${id}`, { isPublic }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
        onError: () => toast.error("Failed to change sharing status."), // 💡 UX Improvement
    });

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const updated = Array.from(entries);
        const [moved] = updated.splice(result.source.index, 1);
        updated.splice(result.destination.index, 0, moved);
        setEntries(updated);
        // NOTE: Visual only. Persisting order server-side would need an additional endpoint.
    };

    if (isLoading) return (
        <div className="mt-16 flex justify-center">
            <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
        </div>
    );

    if (!entries.length) return (
        <div className="mt-20 flex justify-center w-full">
            <Card className="w-full max-w-lg p-10 text-center shadow-2xl shadow-fuchsia-500/10 border-2 border-fuchsia-300 dark:border-fuchsia-700 bg-white dark:bg-gray-800 transition-all duration-300">
                <CardHeader className="flex flex-col items-center p-0">
                    <NotebookPen className="h-16 w-16 text-fuchsia-600 dark:text-fuchsia-400 mb-4 animate-pulse" />
                    <CardTitle className="text-3xl font-extrabold text-gray-800 dark:text-white">
                        Your Notebook is Empty
                    </CardTitle>
                    <CardDescription className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-sm">
                        Start capturing your brilliant ideas, tasks, or knowledge by creating your first note.
                    </CardDescription>
                </CardHeader>
                <CardContent className="mt-8 p-0">
                    <Button
                        className={`${CTA_BUTTON_CLASS} w-full text-lg h-12 font-semibold`}
                        onClick={() => navigate('/app/notes/new')}
                    >
                        <PlusCircle className="h-5 w-5 mr-2" /> Create a New Note
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    // Filter & sort logic (unchanged)
    const filteredEntries = entries
        .filter(entry => {
            if (showSavedOnly && !entry.bookmarked) return false;
            if (selectedCategory !== 'All' && entry.category.name !== selectedCategory) return false;
            const q = searchQuery.trim().toLowerCase();
            if (!q) return true;
            return (
                entry.title.toLowerCase().includes(q) ||
                entry.synopsis.toLowerCase().includes(q) ||
                entry.category.name.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (sortOption === 'pinned') return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
            if (sortOption === 'alphabetical') return a.title.localeCompare(b.title);
            return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        });

    const pinnedNotes = filteredEntries.filter(e => e.pinned);
    const regularNotes = filteredEntries.filter(e => !e.pinned);
    const recentNotes = [...filteredEntries].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).slice(0, 1);
    const bookmarkedNotes = filteredEntries.filter(e => e.bookmarked);

    const categories = ['All', ...Array.from(new Set(entries.map(e => e.category.name)))];

    // share function: ensures note is public then copies link
    const handleShare = async (entry: Entry) => {
        try {
            if (!entry.isPublic) {
                // Make public first
                await togglePublicMutation.mutateAsync({ id: entry.id, isPublic: true });
            }
            // 💡 FIX: Ensure the share URL uses the correct share ID if applicable, though for now using entry.id as a placeholder
            // If your server uses publicShareId for public links, you might adjust the URL generation here.
            const shareUrl = `${window.location.origin}/share/${entry.id}`; 
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Share link copied to clipboard!'); // 💡 UX Improvement
            } else {
                window.prompt('Copy this share link', shareUrl);
            }
        } catch (err) {
            toast.error('Unable to copy share link.'); // 💡 UX Improvement
            console.error(err);
        }
    };

    return (
        <div className="space-y-8">

            {/* Header (unchanged) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold dark:text-white">My Notes</h1>
                <Button className={`${CTA_BUTTON_CLASS} flex items-center gap-2`} onClick={() => navigate('/app/notes/new')}>
                    <PlusCircle className="h-5 w-5" /> New Note
                </Button>
            </div>

            {/* Stats (unchanged) */}
            <div className="flex gap-4 p-4 border border-fuchsia-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="px-4 py-2 rounded-md shadow-sm border border-fuchsia-200 dark:border-fuchsia-900/50 bg-white dark:bg-gray-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Notes</p>
                    <p className={`text-xl font-bold ${PRIMARY_TEXT_CLASS}`}>{entries.length}</p>
                </div>
                <div className="px-4 py-2 rounded-md shadow-sm border border-fuchsia-200 dark:border-fuchsia-900/50 bg-white dark:bg-gray-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Pinned Notes</p>
                    <p className={`text-xl font-bold ${PRIMARY_TEXT_CLASS}`}>{pinnedNotes.length}</p>
                </div>
                <div className="px-4 py-2 rounded-md shadow-sm border border-fuchsia-200 dark:border-fuchsia-900/50 bg-white dark:bg-gray-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Saved</p>
                    <p className={`text-xl font-bold ${PRIMARY_TEXT_CLASS}`}>{entries.filter(e => e.bookmarked).length}</p>
                </div>
            </div>

            {/* Search & Filters (unchanged) */}
            <div className="flex flex-col md:flex-row gap-3 items-center w-full">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search titles, summaries, or categories..."
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
                    <option value="pinned">Pinned First</option>
                    <option value="alphabetical">A-Z</option>
                </select>

                <label className="inline-flex items-center gap-2 text-sm ml-auto">
                    <input
                        type="checkbox"
                        checked={showSavedOnly}
                        onChange={() => setShowSavedOnly(s => !s)}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 focus:ring-fuchsia-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Show saved only</span>
                </label>
            </div>

            {/* Recently Updated (single most recent) (unchanged) */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-inner">
                <h2 className="text-xl font-semibold dark:text-white mb-3 border-b pb-2 border-fuchsia-500/50">Recent Activity</h2>
                <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-fuchsia-400/50 scrollbar-track-gray-200/50">
                    {recentNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            entry={note}
                            onDelete={(id) => deleteMutation.mutate(id)}
                            onTogglePin={(id, pinned) => togglePinMutation.mutate({ id, pinned })}
                            onToggleBookmark={(id, bookmarked) => toggleBookmarkMutation.mutate({ id, bookmarked })}
                            onShare={handleShare}
                            simple
                        />
                    ))}
                </div>
            </div>

            {/* Saved / Bookmarked Section (unchanged) */}
            {bookmarkedNotes.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold dark:text-white mb-4">💾 Saved</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {bookmarkedNotes.map(entry => (
                            <NoteCard
                                key={entry.id}
                                entry={entry}
                                onDelete={(id) => deleteMutation.mutate(id)}
                                onTogglePin={(id, pinned) => togglePinMutation.mutate({ id, pinned })}
                                onToggleBookmark={(id, bookmarked) => toggleBookmarkMutation.mutate({ id, bookmarked })}
                                onShare={handleShare}
                                onTogglePublic={(id, isPublic) => togglePublicMutation.mutate({ id, isPublic })}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Pinned Notes Section (unchanged) */}
            {pinnedNotes.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold dark:text-white mb-4">📌 Pinned Notes</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {pinnedNotes.map(entry => (
                            <NoteCard
                                key={entry.id}
                                entry={entry}
                                onDelete={(id) => deleteMutation.mutate(id)}
                                onTogglePin={(id, pinned) => togglePinMutation.mutate({ id, pinned })}
                                onToggleBookmark={(id, bookmarked) => toggleBookmarkMutation.mutate({ id, bookmarked })}
                                onShare={handleShare}
                                onTogglePublic={(id, isPublic) => togglePublicMutation.mutate({ id, isPublic })}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Regular Notes Section (Draggable Grid) (unchanged) */}
            <h2 className="text-xl font-semibold dark:text-white mb-4">
                {pinnedNotes.length > 0 ? 'Other Notes' : 'All Notes'}
            </h2>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="notes-grid">
                    {(provided) => (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" {...provided.droppableProps} ref={provided.innerRef}>
                            {regularNotes.length ? regularNotes.map((entry, index) => (
                                <Draggable key={entry.id} draggableId={entry.id} index={index}>
                                    {(provided, snapshot) => (
                                        <NoteCard
                                            entry={entry}
                                            isDragging={snapshot.isDragging}
                                            draggableProps={provided.draggableProps}
                                            dragHandleProps={provided.dragHandleProps}
                                            innerRef={provided.innerRef}
                                            onDelete={(id) => deleteMutation.mutate(id)}
                                            onTogglePin={(id, pinned) => togglePinMutation.mutate({ id, pinned })}
                                            onToggleBookmark={(id, bookmarked) => toggleBookmarkMutation.mutate({ id, bookmarked })}
                                            onShare={handleShare}
                                            onTogglePublic={(id, isPublic) => togglePublicMutation.mutate({ id, isPublic })}
                                        />
                                    )}
                                </Draggable>
                            )) : (
                                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                                    No notes match your search or selected category.
                                </div>
                            )}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}