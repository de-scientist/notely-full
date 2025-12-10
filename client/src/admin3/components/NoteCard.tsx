import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Lock, Unlock, Clock, ArrowRight } from "lucide-react";

// Define a proper TypeScript interface for the note data
// Assuming the data structure based on the usage in the original code
interface Note {
  id: string; // Used for linking
  title: string;
  synopsis: string;
  content: string;
  createdAt: string; // Used for displaying creation time
  isPublic?: boolean; // Optional, assumed for status
}

export default function NoteCard({ note }: { note: Note }) {
  // Determine if the note is public (default to false if not specified)
  const isPublic = note.isPublic ?? false;

  // Helper to format the date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Truncate content for a clean snippet
  const contentSnippet = note.content.slice(0, 120).trim() + (note.content.length > 120 ? "..." : "");

  return (
    // Wrap the card in a Link component for the whole area to be clickable
    // Adjust the 'to' path as needed for your routing structure
    <Link to={`/admin/notes/${note.id}`} className="block h-full">
      <Card className="h-full flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-fuchsia-400 dark:hover:border-fuchsia-600">
        
        <CardHeader className="pb-2">
          {/* Metadata: Public/Private Status and Date */}
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
            <span className={`flex items-center font-medium ${isPublic ? 'text-green-600' : 'text-fuchsia-600'}`}>
              {isPublic ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {isPublic ? "Public Note" : "Private Note"}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(note.createdAt)}
            </span>
          </div>

          {/* Title */}
          <CardTitle className="text-xl font-extrabold line-clamp-2">
            {note.title}
          </CardTitle>
          
          {/* Synopsis/Description */}
          <CardDescription className="pt-1 text-sm italic text-gray-500 dark:text-gray-400 line-clamp-2">
            {note.synopsis}
          </CardDescription>
        </CardHeader>

        {/* Content Snippet */}
        <CardContent className="flex-1 pt-3 pb-0">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
            {contentSnippet}
          </p>
        </CardContent>
        
        {/* Action/Read More Indicator */}
        <CardFooter className="pt-4 flex justify-end">
          <span className="flex items-center text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 group-hover:underline">
            View Details
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}