import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "../components/ui/card";
import { Badge } from '../components/ui/badge';
import { Loader2, Tag, ArrowRight, PlusCircle, Star, StarOff, Search, Trash2, Edit } from 'lucide-react';
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
    dateCreated: string;
    lastUpdated: string;
    category: { name: string };
}

// Reusable Note Card Component for consistent UI/UX
interface NoteCardProps {
    entry: Entry;
    isDragging?: boolean;
    draggableProps?: any;
    dragHandleProps?: any;
    innerRef?: React.Ref<HTMLDivElement>;
    onDelete: (id: string) => void;
    onTogglePin: (id: string, pinned: boolean) => void;
}

function NoteCard({ entry, isDragging = false, draggableProps, dragHandleProps, innerRef, onDelete, onTogglePin }: NoteCardProps) {
    const isRecent = !draggableProps; // Check if it's the simplified 'Recently Updated' card

    return (
        <Card
            ref={innerRef}
            {...draggableProps}
            {...dragHandleProps}
            className={`
                group flex flex-col justify-between shadow-lg dark:bg-gray-800 transition-all duration-200
                ${isDragging ? 'scale-[1.03] shadow-xl z-10 border-fuchsia-500' : 'hover:scale-[1.01]'}
                ${entry.pinned && !isRecent ? 'border-2 border-fuchsia-500' : 'border border-gray-200 dark:border-gray-700'}
            `}
        >
            <CardHeader className={`pb-2 ${isRecent ? 'p-3' : 'p-4'}`}>
                <div className="flex justify-between items-start">
                    <CardTitle className={`line-clamp-2 ${isRecent ? 'text-lg' : 'text-xl'} dark:text-white`}>
                        {entry.title}
                    </CardTitle>
                    {entry.pinned && (
                        <Star className="h-5 w-5 ml-2 text-yellow-400 flex-shrink-0" />
                    )}
                </div>
                <div className="mt-1 flex justify-between items-center">
                    <Badge
                        variant="secondary"
                        className={`w-fit text-xs ${PRIMARY_TEXT_CLASS} border-fuchsia-600 dark:border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/30`}
                    >
                        <Tag className="h-3 w-3 mr-1" /> {entry.category.name}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className={`pt-0 ${isRecent ? 'p-3' : 'p-4'}`}>
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {entry.synopsis || entry.content.slice(0, 120) + (entry.content.length > 120 ? '...' : '')}
                </p>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-4 border-t dark:border-gray-700 p-4 space-x-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Updated {new Date(entry.lastUpdated).toLocaleDateString()}
                </span>
                
                {/* // 🟢 Button Alignment Fix: Consolidate actions in a button group
                // Ensures all buttons are size "sm" or "xs" and are aligned right
                */}
                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        variant="outline" 
                        title={entry.pinned ? "Unpin Note" : "Pin Note"}
                        onClick={() => onTogglePin(entry.id, !entry.pinned)}
                    >
                        {entry.pinned ? <StarOff className="h-4 w-4 text-yellow-500" /> : <Star className="h-4 w-4 text-gray-400" />}
                    </Button>
                    <Link to={`/app/notes/${entry.id}/edit`}>
                        <Button size="sm" variant="outline" title="Edit Note">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button 
                        size="sm" 
                        variant="destructive" 
                        title="Delete Note"
                        onClick={() => onDelete(entry.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link to={`/app/notes/${entry.id}`}>
                        <Button size="sm" className={SOLID_BUTTON_CLASS} title="Read Full Note">
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

    useEffect(() => {
        if (data?.entries) setEntries(data.entries);
    }, [data]);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/entries/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
    });

    const togglePinMutation = useMutation({
        mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) =>
            await api.patch(`/entries/${id}`, { pinned }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
    });

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const updated = Array.from(entries);
        const [moved] = updated.splice(result.source.index, 1);
        updated.splice(result.destination.index, 0, moved);
        setEntries(updated);
        // NOTE: Drag-and-drop reordering is visual only. 
        // A backend mutation would be needed here to persist the order.
    };

    if (isLoading) return (
        <div className="mt-16 flex justify-center">
            <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
        </div>
    );

    if (!entries.length) return (
        <div className="mt-16 flex flex-col items-center justify-center text-center space-y-4">
            <PlusCircle className="h-12 w-12 text-fuchsia-500 animate-bounce" />
            <h2 className="text-2xl font-semibold dark:text-white">No Notes Yet</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                You haven&apos;t created any notes yet. Click below to start capturing your ideas!
            </p>
            <Button className={CTA_BUTTON_CLASS} onClick={() => navigate('/app/notes/new')}>
                Create a New Note
            </Button>
        </div>
    );

    // Filter & sort logic
    const filteredEntries = entries
        .filter(entry =>
            (entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.category.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
            (selectedCategory === 'All' || entry.category.name === selectedCategory)
        )
        .sort((a, b) => {
            if (sortOption === 'pinned') return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
            if (sortOption === 'alphabetical') return a.title.localeCompare(b.title);
            return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        });

    const pinnedNotes = filteredEntries.filter(e => e.pinned);
    const regularNotes = filteredEntries.filter(e => !e.pinned);
    const recentNotes = [...filteredEntries].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).slice(0, 3);

    const categories = ['All', ...Array.from(new Set(entries.map(e => e.category.name)))];

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold dark:text-white">My Notes</h1>
                <Button className={`${CTA_BUTTON_CLASS} flex items-center gap-2`} onClick={() => navigate('/app/notes/new')}>
                    <PlusCircle className="h-5 w-5" /> New Note
                </Button>
            </div>

            {/* Stats (Improved visual separation) */}
            <div className="flex gap-4 p-4 border border-fuchsia-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="px-4 py-2 rounded-md shadow-sm border border-fuchsia-200 dark:border-fuchsia-900/50 bg-white dark:bg-gray-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Total Notes</p>
                    <p className={`text-xl font-bold ${PRIMARY_TEXT_CLASS}`}>{entries.length}</p>
                </div>
                <div className="px-4 py-2 rounded-md shadow-sm border border-fuchsia-200 dark:border-fuchsia-900/50 bg-white dark:bg-gray-900/20">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Pinned Notes</p>
                    <p className={`text-xl font-bold ${PRIMARY_TEXT_CLASS}`}>{pinnedNotes.length}</p>
                </div>
            </div>

            {/* Search & Filters */}
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
            </div>

            {/* Recently Updated Section (Horizontal Scroll) */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 shadow-inner">
                <h2 className="text-xl font-semibold dark:text-white mb-3 border-b pb-2 border-fuchsia-500/50">Recent Activity</h2>
                <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-fuchsia-400/50 scrollbar-track-gray-200/50">
                    {recentNotes.map(note => (
                        <NoteCard
                            key={note.id}
                            entry={note}
                            onDelete={(id) => deleteMutation.mutate(id)}
                            onTogglePin={(id, pinned) => togglePinMutation.mutate({ id, pinned })}
                        />
                    ))}
                </div>
            </div>

            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold dark:text-white mb-4">📌 Pinned Notes</h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Use the shared NoteCard component for consistency */}
                        {pinnedNotes.map(entry => (
                            <NoteCard
                                key={entry.id}
                                entry={entry}
                                onDelete={(id) => deleteMutation.mutate(id)}
                                onTogglePin={(id, pinned) => togglePinMutation.mutate({ id, pinned })}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Regular Notes Section (Draggable Grid) */}
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