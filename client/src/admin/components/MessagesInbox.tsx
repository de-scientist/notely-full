import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Assuming these are Shadcn/UI or similar component library imports
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; 
import { Input } from "@/components/ui/input"; 
import { Loader2 } from 'lucide-react'; // Assuming you use lucide icons

// FIX 1: Define the expected type for a UserMessage object
type UserMessage = {
  id: string;
  userId: string | null;
  message: string;
  adminReply: string | null;
  createdAt: string; // ISO Date String
};

// Colors for status badges
const STATUS_COLORS: { [key: string]: string } = {
  New: 'bg-red-100 text-red-700 border-red-200',
  Replied: 'bg-green-100 text-green-700 border-green-200',
  Draft: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};


export default function MessagesInbox() {
  const [reply, setReply] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch messages using react-query
  const { 
    data: messages = [], 
    isLoading, 
    error 
  } = useQuery<UserMessage[]>({
    queryKey: ["admin-messages"],
    queryFn: () => fetch("/admin/messages").then(res => res.json()),
  });

  // Mutation for sending reply
  const replyMutation = useMutation({
    mutationFn: (data: { messageId: string; reply: string }) => 
      fetch("/admin/messages/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate the query to refetch updated messages
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setReply("");
    },
    onError: (err) => {
      console.error("Failed to send reply:", err);
      // Optionally show a toast notification here
    }
  });

  const sendReply = () => {
    if (selectedId && reply.trim()) {
        replyMutation.mutate({ messageId: selectedId, reply: reply.trim() });
    }
  };

  // Get the currently selected message for the detail view
  const selectedMessage = useMemo(() => {
    return messages.find(m => m.id === selectedId);
  }, [messages, selectedId]);

  // Determine message status and badge style
  const getMessageStatus = (m: UserMessage) => {
    if (m.adminReply) return 'Replied';
    // If a reply draft exists for the selected message
    if (m.id === selectedId && reply.trim()) return 'Draft';
    return 'New';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading messages...</div>;
  }

  if (error) {
    return <div className="text-red-600">Error loading messages: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Messages Inbox</h1>
      <div className="flex h-[80vh] border rounded-lg shadow-lg overflow-hidden">
        
        {/* Left Pane: Message List */}
        <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
          <div className="p-4 text-lg font-semibold border-b">
            {messages.length} Total Messages
          </div>
          {messages.map((m) => {
            const status = getMessageStatus(m);
            return (
              <div 
                key={m.id} 
                className={`p-4 border-b cursor-pointer transition-colors ${
                  m.id === selectedId ? 'bg-indigo-100 border-l-4 border-indigo-500' : 'hover:bg-gray-100 border-l-4 border-transparent'
                }`}
                onClick={() => { 
                  setSelectedId(m.id);
                  setReply(m.adminReply || ''); // Pre-fill reply box if already replied
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-700">
                    User ID: {m.userId ?? 'N/A'}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${STATUS_COLORS[status]}`}>
                    {status}
                  </span>
                </div>
                <p className="mt-1 text-gray-900 truncate font-medium">
                  {m.message}
                </p>
                <small className="text-gray-500">
                  {new Date(m.createdAt).toLocaleString()}
                </small>
              </div>
            );
          })}
        </div>

        {/* Right Pane: Message Detail and Reply Form */}
        <div className="w-2/3 p-6 bg-white overflow-y-auto">
          {selectedMessage ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b pb-2">Message Details</h2>
              
              {/* Message Card */}
              <div className="p-4 border rounded-lg bg-indigo-50 shadow-sm">
                <p className="text-sm text-gray-600 mb-1">From User: <span className="font-semibold">{selectedMessage.userId ?? 'Guest'}</span></p>
                <p className="text-lg font-medium">{selectedMessage.message}</p>
                <p className="text-xs text-gray-500 mt-2">Received: {new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>

              {/* Existing Reply */}
              {selectedMessage.adminReply && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Previous Reply</h3>
                  <div className="p-4 border rounded-lg bg-gray-100 whitespace-pre-wrap">
                    {selectedMessage.adminReply}
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-3 pt-4 border-t">
                <h3 className="text-lg font-semibold">Send New Reply</h3>
                <Textarea
                  className="p-3 w-full min-h-[150px]"
                  placeholder="Write your response here..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  disabled={replyMutation.isPending}
                  aria-label={`Reply to message from user ${selectedMessage.userId}`}
                />

                <Button 
                  onClick={sendReply} 
                  disabled={replyMutation.isPending || !reply.trim()}
                >
                  {replyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reply"
                  )}
                </Button>
                {selectedMessage.adminReply && <Button variant="ghost" onClick={() => setSelectedId(null)}>Close</Button>}
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a message from the left to view details and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}