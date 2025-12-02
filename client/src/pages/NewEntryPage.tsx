import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query'; 
import { api } from '../lib/api';

// Markdown Renderer Imports (You must install these: npm install react-markdown remark-gfm)
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm';

// Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator'; // Added Separator for UX
import { Loader2, FilePlus2, BookOpen, PenTool, FolderOpen } from 'lucide-react'; // Added new icons

// 💜 OneNote-inspired color palette
const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const GRADIENT_BUTTON_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-md shadow-fuchsia-500/50 transition-all duration-300";

// ------------------------------------
// 🟢 FIX & FEATURE: Static Categories List
// ------------------------------------
interface Category {
    id: string;
    name: string;
}

const STATIC_CATEGORIES: Category[] = [
    { id: '1', name: 'Productivity' },
    { id: '2', name: 'Design' },
    { id: '3', name: 'Engineering' },
    { id: '4', name: 'Personal Growth' },
    { id: '5', name: 'Career' },
    { id: '6', name: 'Motivation' },
    { id: '7', name: 'Family Affair' },
    { id: '8', name: 'Spiritual' },
    { id: '9', name: 'Study' },
    // Default/Fallback Category
    { id: '0', name: 'Uncategorized' }, 
];
// ------------------------------------


export function NewEntryPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [synopsis, setSynopsis] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState(STATIC_CATEGORIES[0].id); // Default to the first category
    const [error, setError] = useState<string | null>(null);
    
    const mutation = useMutation({
        mutationFn: async () => {
            // categoryId included in post request
            const res = await api.post('/entries', { title, synopsis, content, categoryId });
            return res.data.entry as { id: string };
        },
        onSuccess: (entry) => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            navigate(`/app/notes/${entry.id}`);
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message ?? 'Unable to create entry.';
            setError(msg);
        },
    });

    // 🟢 FIX: Handle form submission via the form element itself
    const onSubmit = (e: FormEvent) => {
        e.preventDefault(); // <-- Prevents the page refresh!
        setError(null);

        // Basic validation check (though we defaulted categoryId)
        if (!categoryId) {
            setError('Please select a category.');
            return;
        }
        mutation.mutate();
    };
    
    // We remove the useCategoriesQuery and isLoadingCategories check now that the data is static.


    return (
        <div className="mx-auto max-w-6xl py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* ======================================= */}
                {/* LEFT COLUMN: FORM */}
                {/* ======================================= */}
                <Card className="dark:bg-gray-800 h-fit">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold dark:text-white flex items-center">
                            <FilePlus2 className={`h-6 w-6 mr-3 ${PRIMARY_TEXT_CLASS}`} />
                            Create New Entry
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Start capturing your new idea, plan, or thought.
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
                                    <Select value={categoryId} onValueChange={setCategoryId} required>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* 🟢 FEATURE: Map static categories */}
                                            {STATIC_CATEGORIES.map((cat: Category) => ( 
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
                                type="submit" 
                                disabled={mutation.isPending} 
                                className={`w-full text-lg font-semibold ${GRADIENT_BUTTON_CLASS}`}
                            >
                                {mutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : 'Create Entry'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* ======================================= */}
                {/* RIGHT COLUMN: PREVIEW CARD (UX Improvement) */}
                {/* ======================================= */}
                <Card className="dark:bg-gray-800 lg:sticky lg:top-8 h-fit">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold dark:text-white">Live Preview</CardTitle>
                        <CardDescription className="dark:text-gray-400">See how your note will look with Markdown rendering.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h2 className={`text-3xl font-extrabold ${PRIMARY_TEXT_CLASS} break-words`}>
                            {title || "Untitled Entry"}
                        </h2>
                        <p className="text-sm text-muted-foreground italic break-words">
                            {synopsis || "No synopsis provided."}
                        </p>
                        <Separator />
                        
                        {/* 🟢 FEATURE: Markdown Renderer */}
                        <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-50 p-4 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 min-h-[300px]">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {content || "Write some content in the editor to see the live Markdown preview here."}
                            </ReactMarkdown>
                        </div>
                        
                    </CardContent>
                    <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
                        Category: {STATIC_CATEGORIES.find(c => c.id === categoryId)?.name ?? 'N/A'}
                    </CardFooter>
                </Card>
                
            </div>
        </div>
    );
}