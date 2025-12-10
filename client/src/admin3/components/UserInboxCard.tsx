import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Trash2, Reply } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define the Props interface
interface Props {
  message: {
    id: string;
    userName: string;
    email: string;
    subject: string;
    content: string;
    createdAt: string;
    // Assume we add a status field for better tracking
    status?: 'new' | 'in_progress' | 'resolved'; 
  };
}

// Helper to format the date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const UserInboxCard: React.FC<Props> = ({ message }) => {
  // Determine badge style based on status (default to 'new')
  const status = message.status || 'new'; 
  let badgeVariant: "default" | "secondary" | "destructive" = "secondary";
  let badgeText = "New";

  if (status === 'in_progress') {
    badgeVariant = "default";
    badgeText = "In Progress";
  } else if (status === 'resolved') {
    badgeVariant = "secondary";
    badgeText = "Resolved";
  }

  // Sanitize content snippet to prevent long text overflow
  const contentSnippet = message.content.length > 150 
    ? message.content.substring(0, 150) + '...'
    : message.content;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
      
      <CardHeader className="pb-3">
        {/* Title and Status Badge */}
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold truncate pr-4">{message.subject}</CardTitle>
          <Badge variant={badgeVariant} className="flex-shrink-0 capitalize">
            {badgeText}
          </Badge>
        </div>
        
        {/* Sender and Date */}
        <div className="space-y-1 mt-1">
          <CardDescription className="flex items-center text-xs text-gray-700 dark:text-gray-400">
            <User className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            {message.userName} 
          </CardDescription>
          <CardDescription className="flex items-center text-xs text-muted-foreground">
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            {message.email}
          </CardDescription>
        </div>

        <Separator className="mt-2" />
      </CardHeader>
      
      {/* Message Snippet */}
      <CardContent className="flex-1 overflow-hidden pt-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
          {contentSnippet}
        </p>
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-4 border-t">
        {/* Date at the bottom */}
        <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="mr-1 h-3.5 w-3.5" />
            {formatDate(message.createdAt)}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="text-fuchsia-600 hover:text-fuchsia-700 border-fuchsia-600 dark:text-fuchsia-400 dark:border-fuchsia-400"
            // onClick={() => handleReply(message)} // Placeholder for reply logic
          >
            <Reply className="mr-1 h-4 w-4" /> Reply
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            // onClick={() => handleDelete(message.id)} // Placeholder for delete logic
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
      
    </Card>
  );
};

export default UserInboxCard;