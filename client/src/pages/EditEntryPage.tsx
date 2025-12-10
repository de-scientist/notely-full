import type { FormEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// UI - Ensured all UI components are imported and used correctly
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card"; // Re-import CardDescription
import { Input } from "../components/ui/input"; // Re-import Input
import { Textarea } from "../components/ui/textarea"; // Re-import Textarea
import { Label } from '../components/ui/label'; // Re-import Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from "../components/ui/switch"; // Re-import Switch
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ScrollArea } from "../components/ui/scroll-area";

// Icons - Ensured all Icons are imported
import {
    Loader2, BookOpen, PenTool, FolderOpen, FilePenLine,
    Eye, Code, ArrowLeftCircle, Bold, Italic, Heading, Code2, Pin,
    Zap, Lightbulb
} from 'lucide-react';

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const GRADIENT_BUTTON_CLASS =
    "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-md shadow-fuchsia-500/50 transition-all duration-300";

interface Category { id: string; name: string; }
interface Entry {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    categoryId: string;
    category: Category;
    pinned: boolean;
    isPublic: boolean;
}

interface AISuggestionResponse {
    suggestion: string;
    title?: string;
    synopsis?: string;
}

const useCategoriesQuery = () =>
    useQuery<{ categories: Category[] }>({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
    });

export function EditEntryPage() {
    const { id } = useParams<{ id: string | undefined }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ----------------------------------------------------
    // START: ALL HOOKS ARE DECLARED HERE UNCONDITIONALLY
    // ----------------------------------------------------

    // Form state (Hooks 14-22)
    const [title, setTitle] = useState('');
    const [synopsis, setSynopsis] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');

    // New states
    const [pinned, setPinned] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [isDirty, setDirty] = useState(false);
    // AI State
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);

    const markDirty = () => setDirty(true);

    // Fetch Entry (useQuery)
    const { data: entryData, isLoading: isLoadingEntry } = useQuery<{ entry: Entry }>({
        queryKey: ['entry', id],
        queryFn: async () => {
            if (!id) throw new Error("Missing ID");
            const res = await api.get(`/entries/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    // Fetch categories (useQuery)
    const { data: categoriesData, isLoading: isLoadingCategories } = useCategoriesQuery();
    const categories = categoriesData?.categories ?? [];

    // Load backend values (useEffect)
    useEffect(() => {
        if (!entryData?.entry) return;
        const e = entryData.entry;

        setTitle(e.title);
        setSynopsis(e.synopsis);
        setContent(e.content);
        setCategoryId(e.category.id);

        setPinned(e.pinned ?? false);
        setIsPublic(e.isPublic ?? false);
        setDirty(false);
    }, [entryData]);

    // Leave warning if unsaved (useEffect)
    useEffect(() => {
        const beforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", beforeUnload);
        return () => window.removeEventListener("beforeunload", beforeUnload);
    }, [isDirty]);

    // Auto-save (useEffect)
    useEffect(() => {
        if (!id) return;
        const auto = setInterval(() => {
            if (!isDirty) return;
            api.patch(`/entries/${id}`, { title, synopsis, content, categoryId, pinned, isPublic });
            setDirty(false);
        }, 10000);
        return () => clearInterval(auto);
    }, [id, title, synopsis, content, categoryId, pinned, isPublic, isDirty]);

    // AI SUGGESTION MUTATION (useMutation)
    const hasSufficientContent =
        title.trim().length > 5 ||
        synopsis.trim().length > 10 ||
        content.trim().length > 50;

    const aiMutation = useMutation({
        mutationFn: async () => {
            setAiSuggestion(null); // Clear previous suggestion
            // FIX: Changed '/api/ai/suggest' to '/ai/suggest' to avoid double /api in the request URL
            const res = await api.post<AISuggestionResponse>('/ai/suggest', { 
                title,
                synopsis,
                content,
            });
            return res.data;
        },
        onSuccess: (data) => {
            setAiSuggestion(data.suggestion);
            setError(null);
            if (data.title && data.title.length > 0) setTitle(data.title);
            if (data.synopsis && data.synopsis.length > 0) setSynopsis(data.synopsis);
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.error ?? "AI suggestion failed. Check server logs.";
            setAiSuggestion(null);
            setError(msg);
        },
    });

    const handleAISuggestion = () => {
        if (aiMutation.isPending || !hasSufficientContent) return;
        aiMutation.mutate();
    };

    // SAVE MUTATION (useMutation)
    const mutation = useMutation({
        mutationFn: async () => {
            if (!id) throw new Error("Entry ID missing.");
            const res = await api.patch(`/entries/${id}`, {
                title, synopsis, content, categoryId,
                pinned, isPublic
            });
            return res.data.entry as Entry;
        },
        onSuccess: (entry) => {
            setDirty(false);
            setAiSuggestion(null); // Clear suggestion on successful save
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            queryClient.invalidateQueries({ queryKey: ['entry', id] });
            navigate(`/app/notes/${entry.id}`);
        },
        onError: (err: any) => {
            setError(err?.response?.data?.message ?? "Failed to update.");
        },
    });

    // Markdown toolbar actions (useCallback)
    const insertMarkdown = useCallback(
        (syntax: string) => {
            setContent((prev) => `${prev}${syntax}`);
            markDirty();
        },
        []
    );

    // ----------------------------------------------------
    // END: ALL HOOKS ARE DECLARED
    // ----------------------------------------------------

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!categoryId) return setError("Select a category");
        mutation.mutate();
    };

    const isLoading = isLoadingEntry || isLoadingCategories;

    // Early Returns (must come after ALL HOOKS)
    if (isLoading)
        return (
            <div className="mt-16 flex justify-center">
                <Loader2 className={`animate-spin h-10 w-10 ${PRIMARY_TEXT_CLASS}`} />
            </div>
        );

    if (!entryData?.entry)
        return (
            <p className="mt-16 text-center text-sm text-muted-foreground">
                Entry not found.
            </p>
        );

    const currentCategoryName =
        categories.find((c) => c.id === categoryId)?.name ??
        entryData.entry.category.name ??
        "N/A";


    // NEW COMPONENT: AI Suggestion Block
    const AISuggestionBlock = () => {
        if (!aiSuggestion) return null;

        return (
            <Card className="dark:bg-gray-900 border-fuchsia-500 border-2 mb-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-xl flex items-center gap-2 ${PRIMARY_TEXT_CLASS}`}>
                        <Zap className="h-5 w-5" /> AI Suggestion
                    </CardTitle>
                    <Button
                        variant="secondary"
                        onClick={() => setAiSuggestion(null)}
                        className="text-xs"
                    >
                        Dismiss
                    </Button>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-48 rounded-md border p-4 bg-gray-50 dark:bg-gray-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {aiSuggestion}
                        </ReactMarkdown>
                    </ScrollArea>
                    <Button
                        className="mt-4 w-full"
                        onClick={() => {
                            setContent(prev => prev + '\n\n' + aiSuggestion);
                            setAiSuggestion(null);
                            markDirty();
                        }}
                    >
                        Append Suggestion to Content
                    </Button>
                </CardContent>
            </Card>
        );
    };

    // Live Preview
    const LivePreview = () => (
        <Card className="dark:bg-gray-900 shadow-xl scale-[1.02]">
            <CardHeader>
                <CardTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
                    <Eye className={`h-6 w-6 ${PRIMARY_TEXT_CLASS}`} /> Live Preview
                </CardTitle>
                {/* Fixed usage of CardDescription */}
                <CardDescription>
                    Real-time rendering of your thoughts.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <AISuggestionBlock />

                <h2 className={`text-3xl font-extrabold ${PRIMARY_TEXT_CLASS}`}>
                    {title || "Untitled Entry"}
                </h2>

                <p className="text-sm text-muted-foreground italic">{synopsis}</p>

                <Separator />

                <div className="prose dark:prose-invert max-w-none p-4 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 min-h-[300px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </CardContent>

            <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t pt-4 dark:border-gray-700">
                Category: {currentCategoryName}
            </CardFooter>
        </Card>
    );

    // Edit form
    const EditForm = () => (
        <Card className="dark:bg-gray-900 shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <FilePenLine className={`h-6 w-6 ${PRIMARY_TEXT_CLASS}`} />
                    Editing: {entryData!.entry.title}
                </CardTitle>
                {/* Fixed usage of CardDescription */}
                <CardDescription>Refine. Expand. Upgrade.</CardDescription>
            </CardHeader>

            <CardContent>
                <form id="edit-form" onSubmit={onSubmit} className="space-y-6">

                    {/* Title + Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Title
                            </Label>
                            <Input value={title} onChange={(e) => { setTitle(e.target.value); markDirty(); }} />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" /> Category
                            </Label>
                            <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); markDirty(); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    {/* Synopsis */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <PenTool className="h-4 w-4" /> Synopsis
                        </Label>
                        <Input
                            value={synopsis}
                            onChange={(e) => { setSynopsis(e.target.value); markDirty(); }}
                        />
                    </div>

                    {/* AI Suggestion Button */}
                    <Alert className="border-fuchsia-500 bg-fuchsia-50/50 dark:bg-fuchsia-950/20">
                        <Lightbulb className={`h-4 w-4 ${PRIMARY_TEXT_CLASS}`} />
                        <AlertTitle className={PRIMARY_TEXT_CLASS}>Smart Writing Assistant</AlertTitle>
                        <AlertDescription className="flex justify-between items-center mt-2">
                            <span>Get AI-powered suggestions to expand or refine your current content.</span>
                            <Button
                                type="button"
                                onClick={handleAISuggestion}
                                disabled={aiMutation.isPending || !hasSufficientContent}
                                className={`ml-4 ${GRADIENT_BUTTON_CLASS}`}
                            >
                                {aiMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="mr-2 h-4 w-4" />
                                        Suggest with AI
                                    </>
                                )}
                            </Button>
                        </AlertDescription>
                        {!hasSufficientContent && (
                            <p className="text-xs text-red-500 mt-2">
                                Add more content (Title &gt; 5 chars OR Synopsis &gt; 10 chars OR Content &gt; 50 chars) to use the AI.
                            </p>
                        )}
                        {aiMutation.isError && (
                            <p className="text-xs text-red-500 mt-2">
                                {error}
                            </p>
                        )}
                    </Alert>

                    {/* Pin Toggle */}
                    <div className="flex items-center justify-between border p-3 rounded-md">
                        <Label className="flex items-center gap-2">
                            <Pin className="h-4 w-4" /> Pin Entry
                        </Label>
                        <Switch checked={pinned} onCheckedChange={(v) => { setPinned(v); markDirty(); }} />
                    </div>

                    {/* Public Toggle */}
                    <div className="flex items-center justify-between border p-3 rounded-md">
                        <Label className="flex items-center gap-2">
                            <Eye className="h-4 w-4" /> Public Visibility
                        </Label>
                        <Switch checked={isPublic} onCheckedChange={(v) => { setIsPublic(v); markDirty(); }} />
                    </div>

                    {/* Markdown Editor */}
                    <div className="space-y-2">

                        <Label className="flex justify-between">
                            <span className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" /> Content
                            </span>
                            <span className="text-xs text-fuchsia-500 flex items-center gap-1">
                                <Code className="h-3 w-3" /> Markdown
                            </span>
                        </Label>

                        {/* Toolbar */}
                        <div className="flex gap-2 p-2 border rounded-md dark:border-gray-700 w-full bg-gray-50 dark:bg-gray-800">
                            <Button type="button" variant="outline" onClick={() => insertMarkdown("**bold** ")}>
                                <Bold className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="outline" onClick={() => insertMarkdown("*italic* ")}>
                                <Italic className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="outline" onClick={() => insertMarkdown("# Heading\n")}>
                                <Heading className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="outline" onClick={() => insertMarkdown("`code` ")}>
                                <Code2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Textarea */}
                        <Textarea
                            rows={18}
                            value={content}
                            onChange={(e) => { setContent(e.target.value); markDirty(); }}
                        />

                        {/* Counters */}
                        <div className="text-xs text-muted-foreground flex justify-between">
                            <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
                            <span>{content.length} characters</span>
                        </div>
                    </div>

                    {error && !aiMutation.isError && <p className="text-sm text-red-500">{error}</p>}
                </form>
            </CardContent>

            {/* Save Button */}
            <CardFooter className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t dark:border-gray-700">
                <Button
                    type="submit"
                    form="edit-form"
                    disabled={mutation.isPending}
                    className={`w-full text-lg font-semibold ${GRADIENT_BUTTON_CLASS}`}
                >
                    {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="mx-auto max-w-7xl py-8 px-4">

            {/* Back */}
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate(`/app/notes/${id}`)}>
                    <ArrowLeftCircle className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>

            {/* Desktop layout */}
            <div className="hidden lg:grid grid-cols-2 gap-8">
                <EditForm />
                <div className="sticky top-6">
                    <LivePreview />
                </div>
            </div>

            {/* Mobile Tabs */}
            <div className="lg:hidden">
                <Tabs defaultValue="edit">
                    <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit" className="mt-4">
                        <EditForm />
                    </TabsContent>

                    <TabsContent value="preview" className="mt-4">
                        <LivePreview />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}