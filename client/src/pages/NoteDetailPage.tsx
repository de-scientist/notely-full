import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import React, { useState } from "react";

// Markdown
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Shadcn UI
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";

// Icons
import {
  Trash2,
  FilePenLine,
  Tag,
  Loader2,
  BookOpen,
  CalendarClock,
  ArrowLeftCircle,
  Info,
  ClipboardList,
  MessageSquare,
  Heart,
  UserCircle,
} from "lucide-react";

// Brand color classes
const PRIMARY = "text-fuchsia-600 dark:text-fuchsia-500";
const OUTLINE =
  "border-fuchsia-500 text-fuchsia-600 dark:border-fuchsia-500 dark:text-fuchsia-500 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/40";
const DELETE_BTN =
  "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/50";
const ACCENT_BG = "bg-fuchsia-50 dark:bg-fuchsia-900/40";

// ------------------------------------
// UPDATED Entry Interface
// ------------------------------------
interface Entry {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  isDeleted: boolean;
  createdAt: string; // Renamed from dateCreated
  updatedAt: string; // Renamed from lastUpdated
  category: {
    name: string;
  };
}
// ------------------------------------

// NEW INTERFACE FOR COMMENTS
interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

/**
 * Helper function to format date strings consistently.
 * @param isoString The ISO date string (e.g., createdAt or updatedAt).
 * @returns Formatted date string.
 */
const formatDateTime = (isoString: string) => {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // MOCK CURRENT USER (for comment posting/liking)
  const CURRENT_USER = "FrontendDev";

  // FRONTEND STATE FOR MOCK COMMENTS
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      user: "Reader123",
      text: "This is an insightful note, especially the part about data handling. Thanks for sharing!",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      likes: 5,
      isLiked: false,
    },
    {
      id: "c2",
      user: "Prodigy",
      text: "I found a small typo on line 42 of the markdown content.",
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      likes: 1,
      isLiked: true, // Mock: Current user liked this
    },
  ]);
  const [newCommentText, setNewCommentText] = useState("");

  // FRONTEND COMMENT LOGIC

  const handlePostComment = () => {
    if (newCommentText.trim() === "") return;

    const newComment: Comment = {
      id: Date.now().toString(), // Mock unique ID
      user: CURRENT_USER,
      text: newCommentText.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    setComments([newComment, ...comments]);
    setNewCommentText("");
  };

  const handleLike = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          // Toggle like state and update likes count
          const newIsLiked = !comment.isLiked;
          const newLikes = comment.likes + (newIsLiked ? 1 : -1);
          return { ...comment, isLiked: newIsLiked, likes: newLikes };
        }
        return comment;
      }),
    );
  };

  // END FRONTEND COMMENT LOGIC

  const { data, isLoading, isError } = useQuery<{ entry: Entry }>({
    queryKey: ["entry", id],
    queryFn: async () => {
      const res = await api.get(`/entries/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      // NOTE: Assuming the DELETE route performs a soft delete
      await api.delete(`/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["entries-trash"] });
      navigate("/app/notes");
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

  // Simple calculation for reading time (200 WPM)
  const wordCount = entry.content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  // COMMENT SECTION COMPONENT
  const CommentSection = () => (
    <Card className="shadow-2xl dark:bg-gray-800/80 border dark:border-gray-700 mt-6">
      <CardHeader>
        <CardTitle
          className={`text-xl font-semibold flex items-center gap-2 ${PRIMARY}`}
        >
          <MessageSquare className="h-5 w-5" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <Separator className="dark:bg-gray-700" />
      <CardContent className="p-8 md:p-10 space-y-6">
        {/* Comment Input Area */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <Textarea
            placeholder="Add a comment..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="dark:bg-gray-800 dark:text-white"
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handlePostComment}
              disabled={newCommentText.trim() === ""}
              className={`bg-fuchsia-600 hover:bg-fuchsia-700 text-white`}
            >
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comment List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b pb-4 dark:border-gray-700 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start space-x-3">
                {/* Mock User Avatar */}
                <UserCircle className={`h-8 w-8 ${PRIMARY} shrink-0`} />

                <div className="flex-1 min-w-0">
                  {/* User and Date */}
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.user}
                      {comment.user === CURRENT_USER && (
                        <span className="ml-2 text-xs font-normal text-fuchsia-500 dark:text-fuchsia-400">
                          (You)
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <CalendarClock className="h-3 w-3 mr-1" />
                      {formatDateTime(comment.timestamp)}
                    </span>
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                    {comment.text}
                  </p>

                  {/* Like Button */}
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(comment.id)}
                      className={`h-6 px-2 text-xs hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/40 ${
                        comment.isLiked
                          ? "text-fuchsia-600 dark:text-fuchsia-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 mr-1 transition-colors ${
                          comment.isLiked
                            ? "fill-fuchsia-600 dark:fill-fuchsia-400"
                            : "fill-none"
                        }`}
                      />
                      {comment.likes} {comment.likes === 1 ? "Like" : "Likes"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
  // END COMMENT SECTION COMPONENT

  return (
    <div className="mx-auto max-w-7xl py-10 px-4">
      {/* Top Navigation / Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className={`text-sm text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-400`}
          onClick={() => navigate("/app/notes")}
        >
          <ArrowLeftCircle className="h-4 w-4 mr-2" />
          Back to All Notes
        </Button>
      </div>

      {/* Main Layout: 2/3 Content, 1/3 Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT COLUMN: CONTENT --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Synopsis Card (Prominent Header) */}
          <Card
            className={`shadow-xl dark:bg-gray-800/80 border-l-4 border-fuchsia-500`}
          >
            <CardHeader className="pb-4">
              <h1 className="text-4xl font-extrabold tracking-tight dark:text-white leading-tight">
                <span
                  className={`${PRIMARY} hover:text-fuchsia-700 transition-colors`}
                >
                  {entry.title}
                </span>
              </h1>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 dark:text-gray-400 italic max-w-2xl border-l-4 pl-4 border-fuchsia-300 dark:border-fuchsia-700">
                {entry.synopsis}
              </p>
            </CardContent>
          </Card>

          {/* Main Content Rendering Card */}
          <Card className="shadow-2xl dark:bg-gray-800/80 border dark:border-gray-700">
            <CardHeader>
              <CardTitle
                className={`text-xl font-semibold flex items-center gap-2 ${PRIMARY}`}
              >
                <BookOpen className="h-5 w-5" />
                Note Content
              </CardTitle>
            </CardHeader>

            <Separator className="dark:bg-gray-700" />

            <CardContent className="p-8 md:p-10">
              {/* Markdown Rendering */}
              <div
                className={`prose lg:prose-xl dark:prose-invert max-w-none 
                                    prose-headings:text-fuchsia-700 dark:prose-headings:text-fuchsia-500 
                                    prose-strong:text-fuchsia-600 dark:prose-strong:text-fuchsia-400
                                    prose-blockquote:border-l-fuchsia-500 dark:prose-blockquote:border-l-fuchsia-400`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom styling for elements
                    h1: ({ node, ...props }) => (
                      <h1
                        {...props}
                        className="text-4xl mt-8 mb-4 font-extrabold"
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 {...props} className="text-3xl mt-7 mb-3 font-bold" />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        {...props}
                        className="text-2xl mt-6 mb-2 font-semibold"
                      />
                    ),

                    // Links: Primary color and bold for prominence
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className={`font-bold ${PRIMARY} hover:text-fuchsia-400 transition-colors underline`}
                      />
                    ),

                    // Lists: Using custom markers for better branding
                    li: ({ node, ...props }) => (
                      <li
                        {...props}
                        className="marker:text-fuchsia-600 dark:marker:text-fuchsia-400"
                      >
                        {props.children}
                      </li>
                    ),

                    // Code Blocks: Clear separation with background and border
                    pre: ({ node, ...props }) => (
                      <pre
                        {...props}
                        className="p-4 rounded-lg bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 overflow-x-auto text-sm"
                      />
                    ),

                    // Inline Code: Muted background
                    code: ({ node, ...props }) => (
                      <code
                        {...props}
                        className="bg-fuchsia-100 dark:bg-fuchsia-900/50 px-1 py-0.5 rounded text-fuchsia-700 dark:text-fuchsia-300 font-mono text-sm"
                      />
                    ),
                  }}
                >
                  {entry.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* NEW: COMMENT SECTION */}
          <CommentSection />
        </div>

        {/* --- RIGHT COLUMN: DETAILS & ACTIONS (Sticky Sidebar) --- */}
        {/* Added 'self-start' and 'lg:top-8' for sticky behavior */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 self-start">
          {/* ACTIONS CARD */}
          <Card className={`shadow-lg dark:bg-gray-900 border ${ACCENT_BG}`}>
            <CardHeader className="pb-3">
              <CardTitle
                className={`text-lg font-semibold flex items-center gap-2 ${PRIMARY}`}
              >
                <ClipboardList className="h-4 w-4" /> Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link to={`/app/notes/${entry.id}/edit`}>
                <Button className={`w-full ${OUTLINE}`}>
                  <FilePenLine className="h-4 w-4 mr-2" />
                  Edit Note
                </Button>
              </Link>
              <Button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className={`w-full ${DELETE_BTN}`}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete (Move to Trash)
              </Button>
            </CardContent>
          </Card>

          {/* METADATA CARD */}
          <Card className="shadow-lg dark:bg-gray-900 border dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle
                className={`text-lg font-semibold flex items-center gap-2 ${PRIMARY}`}
              >
                <Info className="h-4 w-4" /> Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {/* Category */}
              <div className="flex justify-between items-center border-b pb-2 border-fuchsia-100 dark:border-fuchsia-900">
                <span className="font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-fuchsia-500" /> Category
                </span>
                <span className={`font-semibold ${PRIMARY}`}>
                  {entry.category.name}
                </span>
              </div>

              {/* Date Created (FIX: Using createdAt) */}
              <div className="flex justify-between items-center border-b pb-2 border-fuchsia-100 dark:border-fuchsia-900">
                <span className="font-medium flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-fuchsia-500" /> Date
                  Created
                </span>
                <span className="text-right">
                  {formatDateTime(entry.createdAt)}
                </span>
              </div>

              {/* Last Updated (FIX: Using updatedAt) */}
              <div className="flex justify-between items-center border-b pb-2 border-fuchsia-100 dark:border-fuchsia-900">
                <span className="font-medium flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-fuchsia-500" /> Last
                  Updated
                </span>
                <span className="text-right">
                  {formatDateTime(entry.updatedAt)}
                </span>
              </div>

              {/* Word Count & Reading Time */}
              <div className="flex justify-between items-center">
                <span className="font-medium">Word Count</span>
                <span>{wordCount} words</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Reading Time</span>
                <span>~{readingTime} min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
