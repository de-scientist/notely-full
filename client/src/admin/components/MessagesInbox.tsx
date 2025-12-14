import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Using Sonner for toast notifications
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Send,
  MessageSquare,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from "lucide-react";

// Define the expected type for a UserMessage object
type UserMessage = {
  id: string;
  userId: string | null;
  message: string;
  adminReply: string | null;
  createdAt: string; // ISO Date String
};

// Colors for status badges
const STATUS_COLORS: { [key: string]: string } = {
  New: "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-500/30",
  Replied:
    "bg-green-50 text-green-700 border-green-200 ring-1 ring-green-500/30",
  Draft:
    "bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-500/30",
};

// Custom fetcher function to handle JSON parsing errors gracefully
const fetchMessages = async (): Promise<UserMessage[]> => {
  const res = await fetch("/admin/messages");
  if (!res.ok) {
    throw new Error(`Server returned status: ${res.status}`);
  }

  // Check if the response is JSON before parsing
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    // Read response body for debugging
    const text = await res.text();
    console.error("Non-JSON Response Received:", text);
    // 🚨 This is the key fix for the reported error:
    throw new Error(
      "Received non-JSON response. Check if server endpoint `/admin/messages` exists and returns application/json.",
    );
  }
};

export default function MessagesInbox() {
  const [reply, setReply] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch messages using react-query
  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery<UserMessage[], Error>({
    // Explicitly type error as Error
    queryKey: ["admin-messages"],
    queryFn: fetchMessages,
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
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      setReply("");
      toast.success("Reply Sent!", {
        description: "Your response has been delivered to the user.",
        icon: <CheckCircle className="h-4 w-4" />,
      });
    },
    onError: (err) => {
      console.error("Failed to send reply:", err);
      toast.error("Reply Failed", {
        description:
          "Could not send the reply. Check network connection or server endpoint.",
        icon: <XCircle className="h-4 w-4" />,
      });
    },
  });

  const sendReply = () => {
    if (selectedId && reply.trim()) {
      replyMutation.mutate({ messageId: selectedId, reply: reply.trim() });
    }
  };

  // Get the currently selected message for the detail view
  const selectedMessage = useMemo(() => {
    return messages.find((m) => m.id === selectedId);
  }, [messages, selectedId]);

  // Determine message status and badge style
  const getMessageStatus = (m: UserMessage) => {
    if (m.adminReply) return "Replied";
    return "New";
  };

  // Determine current reply status for visual feedback on the list item
  const replyStatus =
    selectedMessage &&
    selectedMessage.id === selectedId &&
    reply.trim() &&
    !selectedMessage.adminReply
      ? "Draft"
      : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48 text-indigo-600">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span className="text-lg font-medium">Loading user messages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center bg-red-50 border border-red-300 rounded-lg m-6">
        <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
        <div className="text-xl font-bold text-red-700 mb-2">
          Error loading messages
        </div>
        <p className="text-red-600 text-sm font-mono break-all">
          {error.message}
        </p>
        <p className="mt-4 text-red-700 font-semibold">
          Please ensure the backend endpoint `/admin/messages` is running and
          returns valid JSON data.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900 flex items-center">
        <MessageSquare className="mr-3 h-7 w-7 text-indigo-600" />
        User Support Inbox
      </h1>
      <div className="flex h-[80vh] border border-gray-200 rounded-xl shadow-2xl overflow-hidden bg-white">
        {/* Left Pane: Message List */}
        <div className="w-1/3 border-r bg-gray-50 overflow-y-auto">
          <div className="p-4 text-lg font-semibold border-b bg-white sticky top-0 z-10">
            {messages.length} Total Conversations
          </div>
          {messages.map((m) => {
            const status =
              replyStatus && m.id === selectedId
                ? replyStatus
                : getMessageStatus(m);

            return (
              <div
                key={m.id}
                className={`p-4 border-b cursor-pointer transition-all duration-150 ${
                  m.id === selectedId
                    ? "bg-indigo-50 border-l-4 border-indigo-600 shadow-inner"
                    : "hover:bg-gray-100 border-l-4 border-transparent"
                }`}
                onClick={() => {
                  setSelectedId(m.id);
                  // Pre-fill reply box with existing reply or clear it
                  setReply(m.adminReply || "");
                }}
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium text-gray-700 flex items-center">
                    User:{" "}
                    <span className="font-bold ml-1">
                      {m.userId ? m.userId.substring(0, 8) + "..." : "Guest"}
                    </span>
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${STATUS_COLORS[status]}`}
                  >
                    {status}
                  </span>
                </div>
                <p className="mt-1 text-gray-900 line-clamp-2 font-medium">
                  {m.message}
                </p>
                <small className="text-gray-500 text-xs">
                  {new Date(m.createdAt).toLocaleDateString()}
                </small>
              </div>
            );
          })}
        </div>

        {/* Right Pane: Message Detail and Reply Form */}
        <div className="w-2/3 p-8 bg-white overflow-y-auto">
          {selectedMessage ? (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-b pb-3 text-indigo-700">
                Conversation Thread
              </h2>

              {/* User Message Card */}
              <div className="p-5 border rounded-xl bg-indigo-50 shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-base font-semibold text-indigo-800">
                    From: {selectedMessage.userId ?? "Guest User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <hr className="mb-3 border-indigo-200" />
                <p className="text-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Existing Reply */}
              {selectedMessage.adminReply ? (
                <div className="space-y-3 p-5 border rounded-xl bg-gray-100 shadow-sm ml-auto w-[95%]">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Your Previous Reply:
                  </h3>
                  <p className="text-base text-gray-800 whitespace-pre-wrap">
                    {selectedMessage.adminReply}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500 p-4 border-dashed border-2 rounded-lg">
                  Awaiting administrator reply.
                </div>
              )}

              {/* Reply Form */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">
                  New Response (
                  {replyStatus === "Draft" ? "Drafting..." : "Ready"})
                </h3>

                <Textarea
                  className="p-4 w-full min-h-[150px] border-gray-300 focus:border-indigo-500"
                  placeholder="Write your professional response here..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  disabled={replyMutation.isPending}
                  aria-label={`Reply to message from user ${selectedMessage.userId}`}
                />

                <div className="flex justify-between">
                  <Button
                    onClick={sendReply}
                    disabled={replyMutation.isPending || !reply.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors w-48"
                  >
                    {replyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reply
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedId(null)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Close Detail
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-10">
              <MessageSquare className="h-10 w-10 mb-4" />
              <p className="text-xl font-medium">No conversation selected.</p>
              <p className="mt-2 text-base">
                Select a message from the left panel to begin reviewing and
                responding.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
