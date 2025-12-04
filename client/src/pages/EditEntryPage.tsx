import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Shadcn UI Components
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'; // NEW: Tabs for mobile UX
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'; // NEW: Tooltip for Markdown help

// Icons
import { Loader2, BookOpen, PenTool, FolderOpen, FilePenLine, Eye, Code, ArrowLeftCircle } from 'lucide-react';

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const GRADIENT_BUTTON_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-md shadow-fuchsia-500/50 transition-all duration-300";

interface Category { id: string; name: string; }
interface Entry { id: string; title: string; synopsis: string; content: string; categoryId: string; category: Category; }

const useCategoriesQuery = () => useQuery<{ categories: Category[] }>({
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

  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: entryData, isLoading: isLoadingEntry } = useQuery<{ entry: Entry }>({
    queryKey: ['entry', id],
    queryFn: async () => {
      if (!id) throw new Error("Entry ID is missing."); 
      const res = await api.get(`/entries/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useCategoriesQuery();
  const categories = categoriesData?.categories ?? [];

  useEffect(() => {
    if (entryData?.entry && entryData.entry.id) {
      setTitle(entryData.entry.title);
      setSynopsis(entryData.entry.synopsis);
      setContent(entryData.entry.content);
      setCategoryId(entryData.entry.category.id);
    }
  }, [entryData]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Entry ID is missing for update.");
      const res = await api.patch(`/entries/${id}`, { title, synopsis, content, categoryId });
      return res.data.entry as Entry;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entry', id] });
      navigate(`/app/notes/${entry.id}`);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? 'Unable to update entry.');
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!categoryId) { setError('Please select a category.'); return; }
    mutation.mutate();
  };

  const isLoading = isLoadingEntry || isLoadingCategories;

  if (isLoading || !id) return (
    <div className="mt-16 flex justify-center">
      <Loader2 className={`animate-spin h-10 w-10 ${PRIMARY_TEXT_CLASS}`} />
    </div>
  );

  if (!entryData?.entry) return (
    <p className="mt-16 text-center text-sm text-muted-foreground">Entry not found or unauthorized.</p>
  );

  const currentCategoryName = categories.find(c => c.id === categoryId)?.name ?? entryData.entry.category.name ?? 'N/A';

  // --- Reusable Live Preview Component ---
  const LivePreview = () => (
    <Card className="dark:bg-gray-900 h-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Eye className={`h-6 w-6 ${PRIMARY_TEXT_CLASS}`} /> Live Preview
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          See how your changes render in real time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <h2 className={`text-3xl font-extrabold ${PRIMARY_TEXT_CLASS} break-words`}>
          {title || entryData.entry.title || "Untitled Entry"}
        </h2>
        <p className="text-sm text-muted-foreground italic break-words">
          {synopsis || entryData.entry.synopsis || "No synopsis provided."}
        </p>
        <Separator />
        <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-50 p-4 border rounded-md dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 min-h-[300px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || "Edit the content on the left to see live preview."}
          </ReactMarkdown>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
        Category: {currentCategoryName}
      </CardFooter>
    </Card>
  );

  // --- Reusable Form Component ---
  const EditForm = () => (
    <Card className="dark:bg-gray-900 h-fit shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <FilePenLine className={`h-6 w-6 ${PRIMARY_TEXT_CLASS}`} />
          Edit: {entryData.entry.title}
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Update title, synopsis, content, and category.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* TITLE */}
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Title
              </Label>
              <Input id="title" value={title} placeholder="Enter note title" onChange={e => setTitle(e.target.value)} required />
            </div>

            {/* CATEGORY */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" /> Category
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoadingCategories || mutation.isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* SYNOPSIS */}
          <div className="space-y-2">
            <Label htmlFor="synopsis" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" /> Synopsis
            </Label>
            <Input id="synopsis" value={synopsis} placeholder="Brief summary of the note" onChange={e => setSynopsis(e.target.value)} required />
          </div>

          {/* CONTENT */}
          <div className="space-y-2">
            <Label htmlFor="content" className="flex justify-between items-center">
                <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Content</span>
                <TooltipProvider>
                    <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                            <span className="text-xs text-fuchsia-500 hover:text-fuchsia-400 flex items-center cursor-help">
                                <Code className="h-3 w-3 mr-1" /> Markdown Supported
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">Use **bold**, *italics*, # Headings, and `code`.</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </Label>
            <Textarea
              id="content"
              rows={15}
              value={content}
              placeholder="Write your note here... Use standard Markdown syntax for formatting."
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        </form>
      </CardContent>
      {/* Sticky footer ensures save button is always reachable */}
      <CardFooter className="lg:static fixed bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700 bg-background/95 backdrop-blur-sm z-10 lg:p-6 lg:border-t-0 lg:bg-transparent lg:backdrop-blur-none">
        <Button 
            type="submit" 
            form="edit-form" // Link button to the form
            onClick={onSubmit} 
            disabled={mutation.isPending || isLoadingCategories} 
            className={`w-full text-lg font-semibold ${GRADIENT_BUTTON_CLASS}`}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="mx-auto max-w-6xl py-8 px-4">
        {/* Back Button */}
        <div className="mb-6">
            <Button variant="ghost" className={`text-sm text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-400`} onClick={() => navigate(`/app/notes/${id}`)}>
                <ArrowLeftCircle className="h-4 w-4 mr-2" />
                Back to Note
            </Button>
        </div>

      {/* Grid for LG screens, Tabs for Mobile */}
      <div className="hidden lg:grid grid-cols-2 gap-10">
          <EditForm />
          <div className="lg:sticky lg:top-8 self-start">
            <LivePreview />
          </div>
      </div>

      {/* Tabs for Mobile/Small Screens */}
      <div className="lg:hidden">
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2"><FilePenLine className="h-4 w-4" /> Edit</TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2"><Eye className="h-4 w-4" /> Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="mt-4">
            <EditForm />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-4 h-full">
            <LivePreview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}