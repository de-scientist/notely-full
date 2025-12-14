import type { FormEvent } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

// UI components
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip"; // Added Tooltip for better info

// Icons
import {
  Loader2,
  BookOpen,
  PenTool,
  FolderOpen,
  FilePenLine,
  Code,
  ArrowLeftCircle,
  Bold,
  Italic,
  Heading,
  Code2,
  Save,
  AlertTriangle,
  Info,
} from "lucide-react";

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
// Adjusted gradient style for buttons to match previous request consistency
const GRADIENT_BUTTON_CLASS =
  "bg-gradient-to-r from-fuchsia-600 to-fuchsia-700 hover:from-fuchsia-700 hover:to-fuchsia-800 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.005] active:scale-[0.995]";
const DISABLED_BUTTON_CLASS =
  "bg-gray-400 dark:bg-gray-600 text-gray-500 border border-gray-500 cursor-not-allowed opacity-70 shadow-none hover:scale-100 active:scale-100";
const CLEAR_DRAFT_BUTTON_CLASS =
  "border-fuchsia-500 text-fuchsia-600 hover:bg-fuchsia-50/50 dark:border-fuchsia-700 dark:text-fuchsia-400 dark:hover:bg-fuchsia-950/50";

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
  pinned: boolean; // Retained in data model but removed from UI
  isPublic: boolean; // Retained in data model but removed from UI
}

const useCategoriesQuery = () =>
  useQuery<{ categories: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
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
  const [title, setTitle] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Internal states
  const [isDirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Removed: AI state (aiSuggestion)
  // Retained: Pinned/Public state to prevent backend save errors if the API expects it.
  const [pinned, setPinned] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const markDirty = () => setDirty(true);

  // Fetch Entry (useQuery)
  const { data: entryData, isLoading: isLoadingEntry } = useQuery<{
    entry: Entry;
  }>({
    queryKey: ["entry", id],
    queryFn: async () => {
      if (!id) throw new Error("Missing ID");
      const res = await api.get(`/entries/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch categories (useQuery)
  const { data: categoriesData, isLoading: isLoadingCategories } =
    useCategoriesQuery();
  const categories = useMemo(
    () => categoriesData?.categories ?? [],
    [categoriesData],
  );

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

  // Auto-save (useEffect) - **IMPORTANT: This auto-save now handles all saving logic since the save button is just a trigger.**
  useEffect(() => {
    if (!id) return;
    const auto = setInterval(() => {
      if (!isDirty) return;
      // Optimistically save the current state without mutation hook for background save
      api
        .patch(`/entries/${id}`, {
          title,
          synopsis,
          content,
          categoryId,
          pinned,
          isPublic,
        })
        .then(() => setDirty(false))
        .catch((err) => console.error("Auto-save failed:", err));
    }, 15000); // Increased interval to 15s for less frequent background work
    return () => clearInterval(auto);
  }, [id, title, synopsis, content, categoryId, pinned, isPublic, isDirty]);

  // SAVE MUTATION (useMutation) - Used only for explicit user save/feedback
  const mutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Entry ID missing.");
      // Manual patch call for explicit save
      const res = await api.patch(`/entries/${id}`, {
        title,
        synopsis,
        content,
        categoryId,
        pinned,
        isPublic,
      });
      return res.data.entry as Entry;
    },
    onSuccess: (entry) => {
      setDirty(false);
      setError(null);
      // Invalidate queries to update entry and list views
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["entry", id] });
      // Optionally redirect back to the view page on successful save
      navigate(`/app/notes/${entry.id}`);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Failed to update.");
    },
  });

  // Removed: aiMutation hook

  // Markdown toolbar actions (useCallback)
  const insertMarkdown = useCallback((syntax: string) => {
    // Note: In a real app, this should insert at the cursor position.
    // For a basic Textarea, appending is the easiest way to demonstrate.
    setContent((prev) => `${prev}${syntax}`);
    markDirty();
  }, []);

  // ----------------------------------------------------
  // END: ALL HOOKS ARE DECLARED
  // ----------------------------------------------------

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!categoryId) return setError("Select a category");
    mutation.mutate();
  };

  const isLoading = isLoadingEntry || isLoadingCategories;
  const isSaving = mutation.isPending;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

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

  // Edit form (now the only main component)
  const EditForm = () => (
    <Card className="dark:bg-gray-900 shadow-xl max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold flex items-center gap-2">
          <FilePenLine className={`h-7 w-7 ${PRIMARY_TEXT_CLASS}`} />
          Edit Knowledge Entry
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          Refine your knowledge base entry: **{entryData!.entry.title}**
        </CardDescription>
        <Separator className="mt-4" />
      </CardHeader>

      <CardContent>
        <form id="edit-form" onSubmit={onSubmit} className="space-y-6">
          {/* Title + Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Title
              </Label>
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" /> Category
              </Label>
              <Select
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  markDirty();
                }}
                disabled={isSaving}
              >
                <SelectTrigger className="focus:ring-fuchsia-500 focus:border-fuchsia-500">
                  <SelectValue placeholder="Select Category" />
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
              onChange={(e) => {
                setSynopsis(e.target.value);
                markDirty();
              }}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground dark:text-gray-500">
              A brief summary of the entry's main points.
            </p>
          </div>

          {/* Markdown Editor */}
          <div className="space-y-2">
            <Label className="flex justify-between">
              <span className="flex items-center gap-2 text-lg font-semibold">
                <BookOpen className="h-5 w-5" /> Content
              </span>
              <span className="text-xs text-fuchsia-500 flex items-center gap-1">
                <Code className="h-3 w-3" /> Markdown Syntax
              </span>
            </Label>

            {/* Toolbar */}
            <div className="flex gap-2 p-2 border rounded-md dark:border-gray-700 w-full bg-gray-50 dark:bg-gray-800">
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => insertMarkdown("**bold** ")}
                      disabled={isSaving}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold</TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => insertMarkdown("*italic* ")}
                      disabled={isSaving}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic</TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => insertMarkdown("# Heading\n")}
                      disabled={isSaving}
                    >
                      <Heading className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Header (H1)</TooltipContent>
                </Tooltip>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => insertMarkdown("`code` ")}
                      disabled={isSaving}
                    >
                      <Code2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Inline Code</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Textarea */}
            <Textarea
              rows={25} // Increased rows for better editing experience
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                markDirty();
              }}
              disabled={isSaving}
              className="resize-y"
            />

            {/* Counters */}
            <div className="text-sm text-muted-foreground flex justify-between pt-1">
              <span
                className={`flex items-center gap-1 ${isDirty ? PRIMARY_TEXT_CLASS : "text-gray-500 dark:text-gray-400"}`}
              >
                <Info className="h-3 w-3" /> Status:{" "}
                {isDirty ? "Unsaved Changes" : isSaving ? "Saving..." : "Saved"}
              </span>
              <span>
                **Stats:** {wordCount} words • {content.length} characters
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && mutation.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Save Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>

      {/* Save Button & Actions */}
      <CardFooter className="p-4 bg-background/95 backdrop-blur-sm border-t dark:border-gray-700 flex justify-between gap-4">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate(`/app/notes/${id}`)}
          className={`w-36 text-sm ${CLEAR_DRAFT_BUTTON_CLASS}`}
          disabled={isSaving}
        >
          <ArrowLeftCircle className="h-4 w-4 mr-2" /> View Note
        </Button>

        {/* Main Save Button */}
        <Button
          type="submit"
          form="edit-form"
          disabled={isSaving || !isDirty}
          className={`flex-1 text-lg font-semibold ${isSaving || !isDirty ? DISABLED_BUTTON_CLASS : GRADIENT_BUTTON_CLASS}`}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving
              Changes...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" /> Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="py-8 px-4">
      <EditForm />
    </div>
  );
}
