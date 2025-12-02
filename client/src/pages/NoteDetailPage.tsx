import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
// 🟢 NEW: Import Markdown Renderer
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
// 🟢 NEW: Import Separator for better UX
import { Separator } from '../components/ui/separator';
import { Trash2, FilePenLine, Tag, Loader2, BookOpen, CalendarClock, User } from 'lucide-react';

// 💜 OneNote-inspired color palette
const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const OUTLINE_BUTTON_CLASS = "border-fuchsia-500 text-fuchsia-600 dark:border-fuchsia-500 dark:text-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/50";
const DELETE_BUTTON_CLASS = "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/50"; // Use a strong color for delete

// ------------------------------------
// Updated Entry Type
// ------------------------------------
interface Entry {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    isDeleted: boolean;
    dateCreated: string;
    lastUpdated: string;
    category: { // Category included via API include
        name: string;
    }
}
// ------------------------------------


export function NoteDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery<{ entry: Entry }>({
        queryKey: ['entry', id],
        queryFn: async () => {
            const res = await api.get(`/entries/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            if (!id) return;
            await api.delete(`/entries/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
            navigate('/app/notes');
        },
    });

    if (isLoading) return <div className="mt-16 flex justify-center"><Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} /></div>;
    
    if (isError || !data?.entry) {
        return <p className="mt-8 text-center text-sm text-muted-foreground">Entry not found or unauthorized.</p>;
    }

    const { entry } = data;
    const formattedDate = new Date(entry.lastUpdated).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

    return (
        <div className="mx-auto max-w-5xl py-8 space-y-6">
            
            {/* Header: Title, Synopsis, and Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-4 border-b dark:border-gray-700">
                
                {/* Title and Metadata Block */}
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight dark:text-white">
                        {/* 🟢 UI/UX Improvement: Use the primary color accent for the title */}
                        <span className={PRIMARY_TEXT_CLASS}>{entry.title}</span>
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 italic">{entry.synopsis}</p>

                    {/* Metadata Badges */}
                    <div className="flex items-center gap-4 pt-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                        {/* Category Badge */}
                        <span className="inline-flex items-center px-3 py-1 bg-fuchsia-50 dark:bg-fuchsia-900/30 rounded-full text-xs font-medium border border-fuchsia-200 dark:border-fuchsia-700">
                            <Tag className={`h-3 w-3 mr-1 ${PRIMARY_TEXT_CLASS}`} />
                            <span className={PRIMARY_TEXT_CLASS}>{entry.category.name}</span>
                        </span>
                        
                        {/* Last Updated Date */}
                        <span className="inline-flex items-center text-xs">
                            <CalendarClock className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                            Last updated: {formattedDate}
                        </span>
                    </div>
                </div>
                
                {/* Actions Buttons */}
                <div className="flex gap-3 shrink-0">
                    <Link to={`/app/notes/${entry.id}/edit`}>
                        <Button 
                            variant="outline" 
                            className={OUTLINE_BUTTON_CLASS}
                        >
                            <FilePenLine className="h-4 w-4 mr-2" />
                            Edit Note
                        </Button>
                    </Link>
                    <Button
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        className={DELETE_BUTTON_CLASS}
                    >
                        {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                    </Button>
                </div>
            </div>
            
            {/* Main Content Card */}
            <Card className="shadow-2xl dark:bg-gray-800/80 border dark:border-gray-700">
                <CardHeader>
                    <CardTitle className={`text-xl font-semibold flex items-center gap-2 ${PRIMARY_TEXT_CLASS}`}>
                        <BookOpen className="h-5 w-5" />
                        Note Content
                    </CardTitle>
                </CardHeader>
                <Separator className="dark:bg-gray-700" />
                <CardContent className="p-8">
                    {/* 🟢 FIX: Markdown Renderer Implementation */}
                    <div className="prose lg:prose-xl dark:prose-invert max-w-none text-gray-900 dark:text-gray-50">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {entry.content}
                        </ReactMarkdown>
                    </div>
                </CardContent>
            </Card>
            
        </div>
    );
}