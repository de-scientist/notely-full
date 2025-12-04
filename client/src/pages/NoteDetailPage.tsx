import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Shadcn UI
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from '../components/ui/separator';

// Icons
import { Trash2, FilePenLine, Tag, Loader2, BookOpen, CalendarClock } from 'lucide-react';

// Brand color classes
const PRIMARY = "text-fuchsia-600 dark:text-fuchsia-500";
const OUTLINE = "border-fuchsia-500 text-fuchsia-600 dark:border-fuchsia-500 dark:text-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/40";
const DELETE_BTN = "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/50";

interface Entry {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    isDeleted: boolean;
    dateCreated: string;
    lastUpdated: string;
    category: {
        name: string;
    };
}

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

    if (isLoading)
        return (
            <div className="mt-16 flex justify-center">
                <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY}`} />
            </div>
        );

    if (isError || !data?.entry) {
        return (
            <p className="mt-8 text-center text-sm text-muted-foreground">
                Entry not found or unauthorized.
            </p>
        );
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
        <div className="mx-auto max-w-5xl py-10 space-y-8">

            {/* Top Section */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b dark:border-gray-700">

                <div className="space-y-1">
                    {/* Title */}
                    <h1 className="text-4xl font-extrabold tracking-tight dark:text-white leading-snug">
                        <span className={`${PRIMARY}`}>
                            {entry.title}
                        </span>
                    </h1>

                    {/* Synopsis */}
                    <p className="text-lg text-gray-600 dark:text-gray-400 italic max-w-2xl">
                        {entry.synopsis}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 pt-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">

                        {/* Category */}
                        <span className="inline-flex items-center px-3 py-1 bg-fuchsia-50 dark:bg-fuchsia-900/40 rounded-full text-xs font-medium border border-fuchsia-200 dark:border-fuchsia-700">
                            <Tag className={`h-3 w-3 mr-1 ${PRIMARY}`} />
                            <span className={PRIMARY}>{entry.category.name}</span>
                        </span>

                        {/* Updated date */}
                        <span className="inline-flex items-center text-xs">
                            <CalendarClock className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                            Last updated: {formattedDate}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 shrink-0">
                    <Link to={`/app/notes/${entry.id}/edit`}>
                        <Button variant="outline" className={OUTLINE}>
                            <FilePenLine className="h-4 w-4 mr-2" />
                            Edit Note
                        </Button>
                    </Link>

                    <Button
                        onClick={() => deleteMutation.mutate()}
                        disabled={deleteMutation.isPending}
                        className={DELETE_BTN}
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

            {/* Main Content */}
            <Card className="shadow-2xl dark:bg-gray-800/80 border dark:border-gray-700">
                <CardHeader>
                    <CardTitle className={`text-xl font-semibold flex items-center gap-2 ${PRIMARY}`}>
                        <BookOpen className="h-5 w-5" />
                        Note Content
                    </CardTitle>
                </CardHeader>

                <Separator className="dark:bg-gray-700" />

                <CardContent className="p-10">

                    {/* Markdown Rendering */}
                    <div className="prose lg:prose-xl dark:prose-invert max-w-none">

                        {/* Brand-colored headings */}
                        <style>
                            {`
                                .prose h1, .prose h2, .prose h3, .prose h4 {
                                    color: rgb(192 38 211); /* fuchsia-600 */
                                }
                                .prose em {
                                    opacity: 0.9;
                                }
                            `}
                        </style>

                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {entry.content}
                        </ReactMarkdown>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
