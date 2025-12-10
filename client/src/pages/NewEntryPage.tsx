import type { FormEvent } from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api'; // Assuming 'api' is configured with axios or fetch wrapper

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Loader2, FilePlus2, BookOpen, PenTool, FolderOpen, ListOrdered, Sparkles, AlertTriangle } from 'lucide-react'; 

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const GRADIENT_BUTTON_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-md shadow-fuchsia-500/50 transition-all duration-300";

// Persistent form state hook
function usePersistentState<T>(key: string, initialState: T): [T, (value: T) => void, () => void] {
    const [state, setState] = useState<T>(() => {
        try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : initialState; } 
        catch { return initialState; }
    });
    useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
    const clearState = useCallback(() => { setState(initialState); localStorage.removeItem(key); }, [initialState]);
    return [state, setState, clearState];
}

interface Category { id: string; name: string; }

interface TOCItem {
    text: string;
    level: number;
    id: string;
}

// Interface for the expected AI response - MATCHING THE SERVICE RESPONSE
interface AiSuggestionResponse {
    improvedContent: string;
    improvedTitle: string;
    improvedSynopsis: string;
    suggestedCategoryName: string; // Matches the key from aiService.ts
}

// --- Component Start ---
export function NewEntryPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // --- State & Data Fetching ---
    const { data, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => (await api.get('/categories')).data as { categories: Category[] },
    });

    const categories = data?.categories ?? [];

    const [title, setTitle, clearTitle] = usePersistentState('newEntryTitle', '');
    const [synopsis, setSynopsis, clearSynopsis] = usePersistentState('newEntrySynopsis', '');
    const [content, setContent, clearContent] = usePersistentState('newEntryContent', '');
    const [categoryId, setCategoryId, clearCategoryId] = usePersistentState('newEntryCategory', '');
    const [error, setError] = useState<string | null>(null);

    const clearForm = () => { clearTitle(); clearSynopsis(); clearContent(); clearCategoryId(); };

    // --- 1. Entry Creation Mutation ---
    const creationMutation = useMutation({
        mutationFn: async () => {
            const res = await api.post('/entries', { title, synopsis, content, categoryId });
            return res.data.entry as { id: string };
        },
        onSuccess: (entry) => {
            clearForm();
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            navigate(`/app/notes/${entry.id}`);
        },
        onError: (err: any) => setError(err?.response?.data?.message ?? 'Unable to create entry.'),
    });

    // --- 2. AI Suggestion Mutation ---
    const aiMutation = useMutation({
        mutationFn: async () => {
            // Send all current draft data to the backend route /api/ai/suggest
            const res = await api.post('/api/ai/suggest', { 
                content: content,
                title: title,
                synopsis: synopsis,
            });
            return res.data as AiSuggestionResponse;
        },
        onSuccess: (data) => {
            // Apply improvements and suggestions
            setTitle(data.improvedTitle);
            setSynopsis(data.improvedSynopsis);
            setContent(data.improvedContent);
            
            // Look up the category ID based on the suggested name
            const suggestedCategory = categories.find(
                cat => cat.name.toLowerCase() === data.suggestedCategoryName.toLowerCase()
            );

            // Only set category if a match is found
            if (suggestedCategory) {
                 setCategoryId(suggestedCategory.id);
            } else if (data.suggestedCategoryName.toLowerCase() !== 'uncategorized') {
                console.warn(`AI suggested category "${data.suggestedCategoryName}" not found locally.`);
            }

            setError(null);
        },
        onError: (err: any) => setError(err?.response?.data?.error ?? 'AI suggestion failed. Please try again.'),
    });
    
    // Determine if we have enough content to justify calling the AI
    // NOTE: Using .trim() ensures that whitespace-only content doesn't count.
    const hasSufficientContent = title.trim().length > 5 || synopsis.trim().length > 10 || content.trim().length > 50;

    // Function to trigger the AI suggestion - FIX APPLIED HERE
    const suggestWithAI = useCallback(() => {
        // Clear previous errors and mutate
        setError(null);

        // Check content length locally before mutating.
        // The disabled prop on the Button should prevent this, but this is a good safeguard.
        if (!hasSufficientContent) {
            setError('Please write a title, synopsis, or at least 50 characters of content before using AI.');
            return;
        }

        aiMutation.mutate();
    }, [aiMutation.mutate, hasSufficientContent]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!categoryId) return setError('Please select a category.');
        creationMutation.mutate();
    };

    // --- Markdown & UI Logic (Unchanged) ---
    const editorRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // Scroll-sync function
    const handleScroll = () => {
        if (!editorRef.current || !previewRef.current) return;
        const editor = editorRef.current;
        const preview = previewRef.current;
        const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        preview.scrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);
    };

    // Scroll to TOC section on click
    const scrollToHeader = (id: string) => {
        const el = document.getElementById(id);
        if (el && previewRef.current) {
            // Calculate scroll position relative to the preview container
            const previewTop = previewRef.current.getBoundingClientRect().top + previewRef.current.scrollTop;
            const targetTop = el.getBoundingClientRect().top + previewRef.current.scrollTop;
            previewRef.current.scrollTop = targetTop - previewTop - 20; // -20 for padding
        }
    };

    // Word, character count & reading time
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const charCount = content.length;
    const readingTime = Math.ceil(wordCount / 200);

    // Generate Table of Contents from Markdown headers
    const toc: TOCItem[] = useMemo(() => {
        const lines = content.split('\n');
        const headers: TOCItem[] = [];
        lines.forEach(line => {
            // Only look for H1, H2, H3
            const match = line.match(/^(#{1,3})\s+(.*)/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                // Create a consistent ID matching the ReactMarkdown renderer
                const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                headers.push({ text, level, id });
            }
        });
        return headers;
    }, [content]);

    // Check if either mutation is running
    const isAnyLoading = creationMutation.isPending || aiMutation.isPending;
    
    // --- Styles for AI Button (FIXED/IMPROVED UX) ---
    // Determine the overall disabled state for the AI button
    const isAiButtonDisabled = aiMutation.isPending || !hasSufficientContent || isAnyLoading;
    
    const aiButtonClasses = [
        "gap-1",
        "h-9", 
        "font-semibold", 
        "text-sm", 
        "transition-all",
        "duration-200",
        isAiButtonDisabled ? 
            "bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border border-gray-400/50 cursor-not-allowed opacity-70" : // Disabled state: Visually unclickable
            aiMutation.isPending ?
                "bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-600/50" : // Loading state
                "bg-fuchsia-50 dark:bg-gray-800 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-600/50 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/80", // Ready state
    ].join(' ');

    return (
        <div className="mx-auto max-w-7xl py-8 px-4">
            <h1 className={`text-3xl font-bold dark:text-white flex items-center gap-2 mb-6 ${PRIMARY_TEXT_CLASS}`}>
                <FilePlus2 className={`h-8 w-8`} /> Create New Entry
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* --- 1. EDITOR FORM (Left Column) --- */}
                <Card className="dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
                            <PenTool className="h-6 w-6" /> Note Details & Content
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Fill in the necessary details and start writing your note using **Markdown**.
                        </CardDescription>
                        <Separator className="mt-4" />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Title</Label>
                                    <Input id="title" placeholder="Catchy title" value={title} onChange={e => setTitle(e.target.value)} required disabled={isAnyLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="flex items-center gap-2"><FolderOpen className="h-4 w-4" />Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoadingCategories || isAnyLoading}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="synopsis">Synopsis</Label>
                                <Input id="synopsis" placeholder="Short summary" value={synopsis} onChange={e => setSynopsis(e.target.value)} required disabled={isAnyLoading} />
                            </div>

                            <div className="space-y-2">
                                <div className='flex justify-between items-end mb-2'>
                                    <Label htmlFor="content">Content (Markdown Editor)</Label>
                                    
                                    {/* AI FUNCTIONALITY BUTTON - FIXED LOGIC & STYLES */}
                                    <Button 
                                        type="button" 
                                        onClick={suggestWithAI} 
                                        // Use the consolidated disabled state variable
                                        disabled={isAiButtonDisabled} 
                                        variant="outline"
                                        size="sm"
                                        className={aiButtonClasses}
                                    >
                                        {aiMutation.isPending ? 
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Suggesting...</> : 
                                            <><Sparkles className="h-4 w-4 text-fuchsia-500" /> Improve with AI</>
                                        }
                                    </Button>
                                    {/* END AI BUTTON */}
                                </div>

                                <Textarea 
                                    id="content" 
                                    rows={20}
                                    placeholder="Start writing using Markdown, e.g., # Main Title, ## Section, *bold*." 
                                    value={content} 
                                    onChange={e => setContent(e.target.value)} 
                                    ref={editorRef} 
                                    onScroll={handleScroll} 
                                    required 
                                    className="resize-y"
                                    disabled={isAnyLoading} 
                                />
                                <p className="text-sm text-muted-foreground dark:text-gray-500 flex justify-between">
                                    <span>**Stats:** {wordCount} words • {charCount} characters</span>
                                    <span>Est. Reading Time: **{readingTime} min**</span>
                                </p>
                            </div>

                            {/* Display Error Message clearly */}
                            {error && (
                                <div className="p-3 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md dark:text-red-400 dark:bg-red-950 dark:border-red-600 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <Button type="submit" disabled={creationMutation.isPending || aiMutation.isPending || !categoryId} className={`w-full text-lg font-semibold ${GRADIENT_BUTTON_CLASS}`}>
                                {creationMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Entry'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* --- 2. LIVE PREVIEW & TOC (Right Column - STICKY) --- */}
                <div className="flex flex-col gap-6 lg:sticky lg:top-8 self-start">
                    
                    {/* LIVE PREVIEW CARD */}
                    <Card className="dark:bg-gray-900 shadow-xl border border-fuchsia-600/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-2xl font-bold dark:text-white">Live Preview</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                See how your note will look after publishing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 overflow-hidden p-4">
                            {/* TITLE & SYNOPSIS */}
                            <h1 className={`text-3xl font-extrabold tracking-tight ${PRIMARY_TEXT_CLASS}`}>
                                {title || "Note Title Preview"}
                            </h1>
                            <p className="italic text-gray-600 dark:text-gray-300 text-lg border-l-4 pl-3 border-fuchsia-400/50">
                                {synopsis || "Short synopsis preview..."}
                            </p>

                            <Separator className="my-4" />

                            {/* CONTENT PREVIEW */}
                            <div
                                ref={previewRef}
                                className="overflow-y-auto max-h-[500px] pr-2 prose prose-base dark:prose-invert
                                        prose-headings:text-fuchsia-600 prose-a:text-fuchsia-500 hover:prose-a:text-fuchsia-400
                                        prose-strong:text-fuchsia-600 prose-li:marker:text-fuchsia-500"
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        // Customize header rendering to use generated IDs for scrolling
                                        h1: ({ node, ...props }) => (
                                            <h1
                                                id={props.children?.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, '')}
                                                {...props}
                                                className="text-3xl font-bold mt-6 mb-3"
                                            />
                                        ),
                                        h2: ({ node, ...props }) => (
                                            <h2
                                                id={props.children?.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, '')}
                                                {...props}
                                                className="text-2xl font-bold mt-5 mb-3"
                                            />
                                        ),
                                        h3: ({ node, ...props }) => (
                                            <h3
                                                id={props.children?.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, '')}
                                                {...props}
                                                className="text-xl font-semibold mt-4 mb-2"
                                            />
                                        ),
                                        p: ({ node, ...props }) => (
                                            <p className="leading-relaxed my-3" {...props} />
                                        ),
                                    }}
                                >
                                    {content || "*Start writing to see a live markdown render here...*"}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>

                    {/* TABLE OF CONTENTS CARD */}
                    <Card className="dark:bg-gray-900 shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xl dark:text-white flex items-center gap-2">
                                <ListOrdered className="h-5 w-5 text-fuchsia-500" /> Table of Contents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {toc.length === 0 ? (
                                <p className="text-sm text-muted-foreground dark:text-gray-500">
                                    Add `#`, `##`, or `###` headings to generate a table of contents.
                                </p>
                            ) : (
                                <nav className="space-y-1">
                                    {toc.map((item, index) => (
                                        <div
                                            key={index}
                                            onClick={() => scrollToHeader(item.id)}
                                            className={`cursor-pointer hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors text-sm truncate 
                                                ${item.level === 2 ? 'pl-2 text-gray-700 dark:text-gray-300' : ''}
                                                ${item.level === 3 ? 'pl-4 text-gray-500 dark:text-gray-400' : ''}`}
                                            style={{ marginLeft: `${(item.level - 1) * 10}px` }}
                                        >
                                            {item.text}
                                        </div>
                                    ))}
                                </nav>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}