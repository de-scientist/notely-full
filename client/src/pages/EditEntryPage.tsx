import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// 🟢 NEW: Markdown Renderer Imports
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator'; // 🟢 NEW: Added Separator
import { Loader2, NotebookText, BookOpen, PenTool, FolderOpen, FilePenLine } from 'lucide-react'; // 🟢 NEW: Added more icons

// 💜 OneNote-inspired color palette
const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const GRADIENT_BUTTON_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-md shadow-fuchsia-500/50 transition-all duration-300";


// ------------------------------------
// Types & Queries
// ------------------------------------
interface Category {
    id: string;
    name: string;
}

interface Entry {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    categoryId: string; 
    category: Category; 
}

const useCategoriesQuery = () => useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
});
// ------------------------------------


export function EditEntryPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [synopsis, setSynopsis] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // --- Fetch Data ---
    const { data: entryData, isLoading: isLoadingEntry } = useQuery<{ entry: Entry }>({
        queryKey: ['entry', id],
        queryFn: async () => {
            const res = await api.get(`/entries/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    const { data: categoriesData, isLoading: isLoadingCategories } = useCategoriesQuery();
    const categories = categoriesData?.categories ?? [];

    // --- State Initialization ---
    useEffect(() => {
        if (entryData?.entry && entryData.entry.id) {
            setTitle(entryData.entry.title);
            setSynopsis(entryData.entry.synopsis);
            setContent(entryData.entry.content);
            setCategoryId(entryData.entry.category.id); 
        }
    }, [entryData]);

    // --- Mutation ---
    const mutation = useMutation({
        mutationFn: async () => {
            const res = await api.patch(`/entries/${id}`, { title, synopsis, content, categoryId });
            return res.data.entry as Entry;
        },
        onSuccess: (entry) => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            queryClient.invalidateQueries({ queryKey: ['entry', id] });
            navigate(`/app/notes/${entry.id}`);
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message ?? 'Unable to update entry.';
            setError(msg);
        },
    });

    // 🟢 FIX: Form submission handling
    const onSubmit = (e: FormEvent) => {
        e.preventDefault(); // <-- Prevents the page refresh!
        setError(null);
        if (!categoryId) {
            setError('Please select a category.');
            return;
        }
        mutation.mutate();
    };

    const isLoading = isLoadingEntry || isLoadingCategories;

    if (isLoading || !id) return <div className="mt-16 flex justify-center"><Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} /></div>;
    if (!entryData?.entry) return <p className="mt-8 text-center text-sm text-muted-foreground">Entry not found or unauthorized.</p>;

    const currentCategoryName = categories.find(c => c.id === categoryId)?.name ?? entryData.entry.category.name ?? 'N/A';

    return (
        <div className="mx-auto max-w-6xl py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* ======================================= */}
                {/* LEFT COLUMN: FORM */}
                {/* ======================================= */}
                <Card className="dark:bg-gray-800 h-fit">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold dark:text-white flex items-center">
                            <FilePenLine className={`h-6 w-6 mr-3 ${PRIMARY_TEXT_CLASS}`} />
                            Edit: {entryData.entry.title}
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Update the title, synopsis, content, and category for this note.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* 🟢 FIX: Form submission logic moved entirely to the form tag */}
                        <form onSubmit={onSubmit} className="space-y-6"> 
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Title</Label>
                                    <Input id="title" placeholder="A catchy title for your note" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                
                                {/* Category Selector */}
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="flex items-center gap-2"><FolderOpen className="h-4 w-4" />Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoadingCategories || mutation.isPending}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Synopsis */}
                            <div className="space-y-2">
                                <Label htmlFor="synopsis" className="flex items-center gap-2"><PenTool className="h-4 w-4" />Synopsis (Short summary)</Label>
                                <Input id="synopsis" placeholder="Briefly summarize your content" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} required />
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Content (Supports Markdown)</Label>
                                <Textarea
                                    id="content"
                                    rows={15}
                                    placeholder="Start writing your note here using Markdown..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                />
                            </div>
                            
                            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                            
                            {/* Submit Button (Moved inside form) */}
                            <Button 
                                type="submit" // 🟢 FIX: Type is submit to trigger form handler
                                disabled={mutation.isPending || isLoadingCategories} 
                                className={`w-full text-lg font-semibold ${GRADIENT_BUTTON_CLASS}`}
                            >
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ======================================= */}
                {/* RIGHT COLUMN: PREVIEW CARD */}
                {/* ======================================= */}
                <Card className="dark:bg-gray-800 lg:sticky lg:top-8 h-fit">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold dark:text-white">Live Preview</CardTitle>
                        <CardDescription className="dark:text-gray-400">See how your changes will render.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h2 className={`text-3xl font-extrabold ${PRIMARY_TEXT_CLASS} break-words`}>
                            {title || entryData.entry.title || "Untitled Entry"}
                        </h2>
                        <p className="text-sm text-muted-foreground italic break-words">
                            {synopsis || entryData.entry.synopsis || "No synopsis provided."}
                        </p>
                        <Separator />
                        
                        {/* 🟢 FEATURE: Markdown Renderer */}
                        <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-50 p-4 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 min-h-[300px]">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content || "Edit the content on the left to see the live Markdown preview here."}
                            </ReactMarkdown>
                        </div>
                        
                    </CardContent>
                    <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
                        Category: {currentCategoryName}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}