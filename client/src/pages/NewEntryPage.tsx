import type { FormEvent } from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Loader2, FilePlus2, BookOpen, PenTool, FolderOpen } from 'lucide-react';

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

export function NewEntryPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

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

    const mutation = useMutation({
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

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!categoryId) return setError('Please select a category.');
        mutation.mutate();
    };

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

    // Word, character count & reading time
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const charCount = content.length;
    const readingTime = Math.ceil(wordCount / 200); // 200 wpm average reading speed

    const isPreviewReady = !!title || !!synopsis || !!content;

    // Generate Table of Contents from Markdown headers
    const toc: TOCItem[] = useMemo(() => {
        const lines = content.split('\n');
        const headers: TOCItem[] = [];
        lines.forEach(line => {
            const match = line.match(/^(#{1,3})\s+(.*)/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                const id = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                headers.push({ text, level, id });
            }
        });
        return headers;
    }, [content]);

    // Scroll to TOC section on click
    const scrollToHeader = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="mx-auto max-w-6xl py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* FORM */}
                <Card className="dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all col-span-2">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
                            <FilePlus2 className={`${PRIMARY_TEXT_CLASS} h-6 w-6`} />
                            Create New Entry
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Start capturing your idea, plan, or thought.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Title</Label>
                                    <Input id="title" placeholder="Catchy title" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="flex items-center gap-2"><FolderOpen className="h-4 w-4" />Category</Label>
                                    <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoadingCategories}>
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
                                <Label htmlFor="synopsis" className="flex items-center gap-2"><PenTool className="h-4 w-4" />Synopsis</Label>
                                <Input id="synopsis" placeholder="Short summary" value={synopsis} onChange={e => setSynopsis(e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content" className="flex items-center gap-2"><BookOpen className="h-4 w-4" />Content (Markdown)</Label>
                                <Textarea 
                                    id="content" 
                                    rows={15} 
                                    placeholder="Start writing..." 
                                    value={content} 
                                    onChange={e => setContent(e.target.value)} 
                                    ref={editorRef} 
                                    onScroll={handleScroll} 
                                    required 
                                />
                                <p className="text-sm text-muted-foreground">
                                    {wordCount} words • {charCount} characters • {readingTime} min read
                                </p>
                            </div>

                            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

                            <Button type="submit" disabled={mutation.isPending} className={`w-full text-lg font-semibold ${GRADIENT_BUTTON_CLASS}`}>
                                {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Entry'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* LIVE PREVIEW + TOC */}
                <div className="flex flex-col gap-4 sticky top-8">
                    <Card className="dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold dark:text-white">Live Preview</CardTitle>
                            <CardDescription className="dark:text-gray-400">Markdown rendering of your note.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 overflow-hidden max-h-[600px]">
                            <div ref={previewRef} className="overflow-y-auto max-h-[550px] px-2">
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]} 
                                    components={{
                                        h1: ({node, ...props}) => <h1 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} className="text-3xl font-bold mt-6 mb-2" />,
                                        h2: ({node, ...props}) => <h2 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} className="text-2xl font-bold mt-4 mb-2" />,
                                        h3: ({node, ...props}) => <h3 id={props.children?.toString().toLowerCase().replace(/\s+/g, '-')} {...props} className="text-xl font-semibold mt-3 mb-2" />
                                    }}
                                >
                                    {content || 'Write content to preview here.'}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                        <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-2">
                            Category: {categories.find(c => c.id === categoryId)?.name ?? 'N/A'}
                        </CardFooter>
                    </Card>

                    {toc.length > 0 && (
                        <Card className="dark:bg-gray-800 shadow-md p-4 max-h-[300px] overflow-y-auto">
                            <h3 className="text-lg font-bold dark:text-white mb-2">Table of Contents</h3>
                            <ul className="space-y-1">
                                {toc.map(item => (
                                    <li key={item.id} className={`pl-${(item.level - 1) * 4} cursor-pointer text-sm text-fuchsia-600 hover:underline`}
                                        onClick={() => scrollToHeader(item.id)}>
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
