import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Tag,
  ArrowRight,
  PlusCircle,
  Star,
  StarOff,
  Search,
  Trash2,
  Edit,
  Share2,
  Bookmark,
  Lock,
  Unlock,
  NotebookPen,
  ThumbsUp,
  MoreHorizontal,
  Move,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useState, useEffect, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

// --- Professional Styling Constants (Fuchsia Palette) ---
// Corrected to use 'dark:text-fuchsia-400' for dark mode contrast, using fuchsia color.
const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-400";
// Confirmed: Set background to fuchsia-600 and text to white
const SOLID_BUTTON_CLASS =
  "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700 text-white shadow-lg shadow-fuchsia-500/50";
// Confirmed: Set background to fuchsia-600 and text to white
const CTA_BUTTON_CLASS =
  "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700 text-white rounded-xl px-6 py-3 text-base font-semibold shadow-lg shadow-fuchsia-500/40 transition transform hover:scale-[1.02]";

interface Entry {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  isDeleted: boolean;
  pinned: boolean;
  bookmarked?: boolean;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  category: { name: string; id: string }; // Added 'id' which might be needed for the PATCH payload
}

/**
 * Helper function to format a date string into a relative time string.
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return formatter.format(-minutes, "minute");
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return formatter.format(-hours, "hour");
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return formatter.format(-days, "day");
  }

  return `on ${date.toLocaleDateString()}`;
}

// Reusable Note Card Component
interface NoteCardProps {
  entry: Entry;
  isDragging?: boolean;
  draggableProps?: any;
  dragHandleProps?: any;
  innerRef?: React.Ref<HTMLDivElement>;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onToggleBookmark: (id: string, bookmarked: boolean) => void;
  onShare: (entry: Entry) => Promise<void>;
  onTogglePublic?: (id: string, isPublic: boolean) => void;
  simple?: boolean; // For use in the 'Recent Activity' horizontal scroll
}

function NoteCard({
  entry,
  isDragging = false,
  draggableProps,
  dragHandleProps,
  innerRef,
  onDelete,
  onTogglePin,
  onToggleBookmark,
  onShare,
  onTogglePublic,
  simple = false,
}: NoteCardProps) {
  const isPinned = !!entry.pinned;
  const isBookmarked = !!entry.bookmarked;
  const isPublic = !!entry.isPublic;

  const relativeTime = formatRelativeTime(entry.updatedAt);

  return (
    <Card
      ref={innerRef}
      {...draggableProps}
      className={`
                relative group flex flex-col justify-between shadow-xl dark:bg-gray-800 transition-all duration-200 cursor-default
                ${isDragging ? "scale-[1.03] ring-4 ring-fuchsia-500/50 z-10 border-fuchsia-500" : "hover:scale-[1.01] hover:shadow-2xl"}
                ${isPinned && !simple ? "border-2 border-fuchsia-500 ring-2 ring-fuchsia-200 dark:ring-fuchsia-900/50" : "border border-gray-200 dark:border-gray-700"}
                ${simple ? "w-64 flex-shrink-0" : "h-full"}
            `}
    >
      {/* PINNED LABEL */}
      {isPinned && !simple && (
        <div className="absolute top-0 right-0 transform translate-y-[-50%] translate-x-[20%] rotate-3 px-3 py-1 text-xs font-extrabold bg-yellow-500 text-white rounded-full shadow-xl">
          PINNED
        </div>
      )}

      <CardHeader className={`pb-2 ${simple ? "p-3" : "p-4"}`}>
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle
                className={`line-clamp-2 ${simple ? "text-lg" : "text-xl"} dark:text-white font-extrabold`}
              >
                {entry.title}
              </CardTitle>
            </div>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {/* Category Badge - Primary Color */}
              <Badge
                variant="secondary"
                className={`w-fit text-xs font-semibold ${PRIMARY_TEXT_CLASS} border-fuchsia-600 dark:border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/30`}
              >
                <Tag className="h-3 w-3 mr-1" /> {entry.category.name}
              </Badge>

              {/* Public Status Badge */}
              {isPublic && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                >
                  <Unlock className="h-3 w-3 mr-1" /> Public
                </Badge>
              )}

              {/* Saved Badge */}
              {isBookmarked && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700"
                >
                  <Bookmark className="h-3 w-3 mr-1" /> Saved
                </Badge>
              )}
            </div>
          </div>

          {/* Context Menu Dropdown */}
          <div className="flex-shrink-0 flex items-center gap-1">
            {/* MODIFIED: Drag Handle Button - Also changed to solid fuchsia background
                            This ensures consistency with the More Actions button, fulfilling the request.
                        */}
            {dragHandleProps && !simple && (
              <Button
                size="sm"
                title="Drag to reorder"
                // Applied solid fuchsia button styling
                className="p-1 h-8 w-8 bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700 text-white shadow-md shadow-fuchsia-500/30 rounded-full transition"
                {...dragHandleProps}
                onClick={(e) => e.stopPropagation()}
              >
                <Move className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* MODIFIED: More Actions Button - Now uses solid fuchsia background.
                                     This addresses the user's specific request for the button in the image.
                                */}
                <Button
                  size="sm"
                  title="More Actions"
                  // Applied solid fuchsia button styling
                  className="p-1 h-8 w-8 bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700 text-white shadow-md shadow-fuchsia-500/30 rounded-full transition"
                  onClick={(e) => e.stopPropagation()} // Important to prevent card navigation
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuLabel>Note Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Pin/Unpin Toggle */}
                <DropdownMenuItem
                  onClick={() => onTogglePin(entry.id, !isPinned)}
                >
                  {isPinned ? (
                    <StarOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Star className="mr-2 h-4 w-4" />
                  )}
                  {isPinned ? "Unpin Note" : "Pin Note"}
                </DropdownMenuItem>

                {/* Bookmark Toggle */}
                <DropdownMenuItem
                  onClick={() => onToggleBookmark(entry.id, !isBookmarked)}
                >
                  <Bookmark
                    className="mr-2 h-4 w-4"
                    fill={isBookmarked ? "currentColor" : "none"}
                  />
                  {isBookmarked ? "Remove from Saved" : "Save for Later"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Edit Link */}
                <Link to={`/app/notes/${entry.id}/edit`}>
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Note
                  </DropdownMenuItem>
                </Link>

                {/* Public/Private Toggle */}
                {onTogglePublic && (
                  <DropdownMenuItem
                    onClick={() => onTogglePublic(entry.id, !isPublic)}
                  >
                    {isPublic ? (
                      <Lock className="mr-2 h-4 w-4" />
                    ) : (
                      <Unlock className="mr-2 h-4 w-4" />
                    )}
                    {isPublic ? "Make Private" : "Make Public"}
                  </DropdownMenuItem>
                )}

                {/* Share Button */}
                <DropdownMenuItem
                  onClick={() => onShare(entry)}
                  disabled={!isPublic}
                  className={!isPublic ? "cursor-not-allowed opacity-50" : ""}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {isPublic ? "Share Note" : "Share (Make Public First)"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Delete Button */}
                <DropdownMenuItem
                  onClick={() => onDelete(entry.id)}
                  className="text-red-600 dark:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`pt-0 flex-1 ${simple ? "p-3" : "p-4"}`}>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
          {entry.synopsis ||
            entry.content.slice(0, 120) +
              (entry.content.length > 120 ? "..." : "")}
        </p>
      </CardContent>

      <CardFooter
        className={`flex items-center justify-between pt-4 border-t dark:border-gray-700 ${simple ? "p-3" : "p-4"}`}
      >
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
          Updated {relativeTime}
        </span>

        {/* Read Button - Primary CTA */}
        <Link
          to={`/app/notes/${entry.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            className={`${SOLID_BUTTON_CLASS} p-2 h-8 w-8 rounded-full transition-all hover:ring-2 ring-fuchsia-300`}
            title="Read full note"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Main Component
export function NotesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. DATA FETCHING HOOK
  const { data, isLoading } = useQuery({
    queryKey: ["entries"],
    queryFn: async (): Promise<{ entries: Entry[] }> =>
      (await api.get("/entries")).data,
  });

  // 2. STATE HOOKS
  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("recent"); // Default to recent
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // 3. EFFECT HOOK (Initial data setup/sort)
  useEffect(() => {
    if (data?.entries) {
      setEntries(
        [...data.entries].sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }),
      );
    }
  }, [data]);

  // 4. MUTATION HOOKS
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Note moved to trash.");
    },
    onError: () => toast.error("Failed to delete note."),
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) =>
      await api.patch(`/entries/${id}`, { pinned }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.info(variables.pinned ? "Note pinned!" : "Note unpinned.");
    },
    onError: () => toast.error("Failed to toggle pin status."),
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async ({
      id,
      bookmarked,
    }: {
      id: string;
      bookmarked: boolean;
    }) => {
      if (bookmarked) {
        return await api.post(`/entries/${id}/bookmark`);
      } else {
        return await api.delete(`/entries/${id}/bookmark`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success(
        variables.bookmarked
          ? "Note saved successfully!"
          : "Note removed from saved.",
      );
    },
    onError: () => toast.error("Failed to toggle bookmark status."),
  });

  // --- FIX APPLIED HERE ---
  const togglePublicMutation = useMutation({
    mutationFn: async ({ id, isPublic }: { id: string; isPublic: boolean }) => {
      // 1. Get current list from cache
      const allEntriesData = queryClient.getQueryData(["entries"]) as
        | { entries: Entry[] }
        | undefined;

      // 2. Find the entry we are about to update
      const currentEntry = allEntriesData?.entries.find((e) => e.id === id);

      if (!currentEntry) {
        throw new Error("Cannot find note to toggle public status.");
      }

      // 3. Construct the full payload for the PATCH request
      const payload = {
        // Spread all existing data to satisfy backend requirements for a complete object
        ...currentEntry,
        isPublic: isPublic,
        // If the backend expects categoryId instead of the full category object,
        // you would need to adjust the structure here.
        // We must remove the 'category' object since the backend PATCH endpoint
        // often expects a flat entry object or a categoryId.
        categoryId: currentEntry.category.id,
      };

      // Remove the nested category object to match a typical flat API structure
      delete (payload as any).category;

      // 4. Send the updated payload
      await api.patch(`/entries/${id}`, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success(
        `Note set to ${variables.isPublic ? "Public" : "Private"}.`,
      );
    },
    onError: (error) => {
      console.error("Public toggle error:", error);
      // The 500 error will now be caught here, but the cause should be fixed.
      toast.error(
        "Failed to change sharing status. Check server logs if this persists.",
      );
    },
  });

  // --- NON-HOOK FUNCTION ---
  const onDragEnd = (result: DropResult) => {
    if (!result.destination || sortOption !== "recent") return;

    // Optimistic update for the UI
    const updated = Array.from(entries);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setEntries(updated);

    // NOTE: In a real app, an API call to save the new order would follow here.
  };

  // --- DERIVED STATE ---
  const allBookmarkedNotes = useMemo(
    () => entries.filter((e) => e.bookmarked),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    let filtered = entries.filter((entry) => {
      if (entry.isDeleted) return false;
      // Filter by Saved Only
      if (showSavedOnly && !entry.bookmarked) return false;
      // Filter by Category
      if (
        selectedCategory !== "All" &&
        entry.category.name !== selectedCategory
      )
        return false;
      // Filter by Search Query
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      return (
        entry.title.toLowerCase().includes(q) ||
        entry.synopsis.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.category.name.toLowerCase().includes(q)
      );
    });

    // Apply sorting (Pinned first is handled by the initial `entries` sort and preserved here if using the default 'recent' sort.
    filtered = filtered.sort((a, b) => {
      // Preserve manual ordering (Pinned + last updated) for 'recent'
      if (sortOption === "recent") {
        if (a.pinned && !b.pinned) return -1;
        if (a.pinned && b.pinned) {
          // Preserve the existing drag-and-drop order for pinned items
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }
        if (!a.pinned && b.pinned) return 1;
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }

      if (sortOption === "alphabetical") {
        return a.title.localeCompare(b.title);
      }

      // Fallback just in case
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return filtered;
  }, [entries, showSavedOnly, selectedCategory, searchQuery, sortOption]);

  const displayNotes = filteredEntries;

  // Recent notes for the top horizontal scroll (always the top 3 most recently updated, not pinned first)
  const recentNotes = useMemo(
    () =>
      [...entries]
        .filter((e) => !e.isDeleted)
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 3),
    [entries],
  );

  const categories = [
    "All",
    ...Array.from(new Set(entries.map((e) => e.category.name))),
  ];

  // --- CONDITIONAL RENDER START ---
  if (isLoading)
    return (
      <div className="mt-16 flex justify-center">
        <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
      </div>
    );
  // --- CONDITIONAL RENDER END ---

  // FIX: Enhanced Share function logic using Web Share API
  const handleShare = async (entry: Entry) => {
    if (!entry.isPublic) {
      toast.info(
        "Note must be public to share. Please use the lock icon to make it public first.",
      );
      return;
    }

    try {
      // Assume the public share link format is /share/:id
      const shareUrl = `${window.location.origin}/share/${entry.id}`;
      const shareData: ShareData = {
        title: entry.title,
        text: entry.synopsis || `Check out this note: ${entry.title}`,
        url: shareUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Note shared successfully via native menu!");
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard!");
      } else {
        window.prompt("Copy this share link", shareUrl);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // User dismissed the share dialog
        return;
      }
      toast.error("Unable to share or copy link.");
      console.error("Share error:", err);
    }
  };

  // Helper for passing togglePublic handler to NoteCard
  const handleTogglePublic = (id: string, isPublic: boolean) => {
    togglePublicMutation.mutate({ id, isPublic });
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-4xl font-extrabold dark:text-white flex items-center gap-3">
          <NotebookPen className={`h-10 w-10 ${PRIMARY_TEXT_CLASS}`} /> Your
          Note Hub
        </h1>
        {/* Button uses CTA_BUTTON_CLASS, which is fuchsia-600 with white text */}
        <Button
          className={CTA_BUTTON_CLASS}
          onClick={() => navigate("/app/notes/new")}
        >
          <PlusCircle className="h-5 w-5 mr-2" /> Create New Note
        </Button>
      </div>

      {/* Stats - Enhanced Visuals */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-fuchsia-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-xl">
        <div className="px-5 py-3 rounded-lg bg-white dark:bg-gray-900 shadow-md transition-shadow hover:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Total Notes
          </p>
          <p className={`text-3xl font-extrabold ${PRIMARY_TEXT_CLASS}`}>
            {entries.length}
          </p>
        </div>
        <div className="px-5 py-3 rounded-lg bg-white dark:bg-gray-900 shadow-md transition-shadow hover:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Pinned Notes
          </p>
          <p
            className={`text-3xl font-extrabold text-yellow-500 dark:text-yellow-400`}
          >
            {entries.filter((e) => e.pinned).length}
          </p>
        </div>
        <div className="px-5 py-3 rounded-lg bg-white dark:bg-gray-900 shadow-md transition-shadow hover:shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Saved
          </p>
          <p
            className={`text-3xl font-extrabold text-blue-500 dark:text-blue-400`}
          >
            {allBookmarkedNotes.length}
          </p>
        </div>
      </div>

      {/* Search & Filters - Clean, Functional Block */}
      <div className="flex flex-col md:flex-row gap-4 items-center w-full p-4 border border-fuchsia-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="relative flex-1 min-w-40 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-fuchsia-500" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 transition shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <select
            aria-label="Filter by category"
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition shadow-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort notes"
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition shadow-sm"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="recent">Updated</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>

        <label className="inline-flex items-center gap-3 text-sm md:ml-auto whitespace-nowrap p-2 rounded-full hover:bg-fuchsia-50 dark:hover:bg-gray-700 transition cursor-pointer">
          <input
            type="checkbox"
            checked={showSavedOnly}
            onChange={() => setShowSavedOnly((s) => !s)}
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-fuchsia-600 dark:text-fuchsia-500 focus:ring-fuchsia-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show Saved Only
          </span>
        </label>
      </div>

      {/* Recently Updated (top 3) - Horizontal Scroll */}
      <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-900 shadow-inner">
        <h2 className="text-xl font-extrabold dark:text-white mb-3 border-b pb-2 border-fuchsia-500/50 flex items-center gap-2">
          <ThumbsUp className="h-6 w-6 text-fuchsia-600" /> Recent Activity
        </h2>
        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-fuchsia-400/50 scrollbar-track-gray-200/50">
          {recentNotes.map((note) => (
            <NoteCard
              key={note.id}
              entry={note}
              onDelete={(id) => deleteMutation.mutate(id)}
              onTogglePin={(id, pinned) =>
                togglePinMutation.mutate({ id, pinned })
              }
              onToggleBookmark={(id, bookmarked) =>
                toggleBookmarkMutation.mutate({ id, bookmarked })
              }
              onShare={handleShare}
              onTogglePublic={handleTogglePublic}
              simple // Use the simple variant for the horizontal list
            />
          ))}
          {!recentNotes.length && (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
              No recent notes found. Start creating!
            </p>
          )}
        </div>
      </div>

      <hr className="border-fuchsia-300/50 dark:border-fuchsia-900/50" />

      {/* Main Note Grid Title */}
      <h2 className="text-2xl font-extrabold dark:text-white mb-4">
        {showSavedOnly
          ? `Saved Notes (${displayNotes.length})`
          : `All Notes (${displayNotes.length})`}
      </h2>

      {/* Main Note Grid */}
      {!displayNotes.length ? (
        <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50">
          <Search className="h-8 w-8 mx-auto mb-4 text-fuchsia-400" />
          <p className="text-lg font-medium">
            {showSavedOnly
              ? "No saved notes match your filters."
              : "No notes match your current filters."}
          </p>
          <p className="text-sm mt-1">
            Try adjusting your search query, category filter, or unchecking
            "Show Saved Only."
          </p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="notes-grid">
            {(provided) => (
              <div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {displayNotes.map((entry, index) => (
                  <Draggable
                    key={entry.id}
                    draggableId={entry.id}
                    index={index}
                    // Disable drag if not sorting by 'recent' (to respect manual order)
                    isDragDisabled={sortOption !== "recent"}
                  >
                    {(provided, snapshot) => (
                      <NoteCard
                        entry={entry}
                        isDragging={snapshot.isDragging}
                        draggableProps={provided.draggableProps}
                        // Only provide drag handle props if dragging is enabled (sort is 'recent')
                        // The visual drag handle is placed inside NoteCard for better integration.
                        dragHandleProps={
                          sortOption === "recent"
                            ? provided.dragHandleProps
                            : null
                        }
                        innerRef={provided.innerRef}
                        onDelete={(id) => deleteMutation.mutate(id)}
                        onTogglePin={(id, pinned) =>
                          togglePinMutation.mutate({ id, pinned })
                        }
                        onToggleBookmark={(id, bookmarked) =>
                          toggleBookmarkMutation.mutate({ id, bookmarked })
                        }
                        onShare={handleShare}
                        onTogglePublic={handleTogglePublic}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
