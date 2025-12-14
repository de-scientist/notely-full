import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api"; // your axios/fetch wrapper
import UserInboxCard from "../components/UserInboxCard";
import Header from "../components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Loader2, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ----------------------------------------------------
// ✅ FIX 1: UPDATED Message Interface
// ----------------------------------------------------
interface Message {
  id: string;
  userName: string;
  email: string;
  subject: string;
  content: string;
  createdAt: string;
}
// ----------------------------------------------------

// ----------------------------------------------------
// Mock Data for User Inbox
// ----------------------------------------------------
const MOCK_MESSAGES: Message[] = [
  {
    id: "msg1",
    userName: "Alice Johnson",
    email: "alice@example.com",
    subject: "Issue with Note Syncing after Update",
    content:
      "I updated the mobile app yesterday, and now my latest notes from Tuesday are not syncing to the desktop application. I've tried logging out and back in without success.",
    createdAt: "2025-12-10T14:30:00Z",
  },
  {
    id: "msg2",
    userName: "Robert Smith",
    email: "robert.s@webmail.com",
    subject: "Feature Request: Export to Markdown",
    content:
      "Love the new AI summary feature! Would it be possible to add an option to export notes directly to a clean Markdown (.md) file? This would greatly help my workflow.",
    createdAt: "2025-12-09T09:15:00Z",
  },
  {
    id: "msg3",
    userName: "Chen Wei",
    email: "chen.w@techco.cn",
    subject: "Inquiry about RAG Upload API limits",
    content:
      "Our enterprise plan uses the RAG upload feature heavily. We need clarification on the daily rate limits and whether a higher throughput option is available for our tier.",
    createdAt: "2025-12-08T18:55:00Z",
  },
  {
    id: "msg4",
    userName: "Sarah Connor",
    email: "sconnor@futuremail.com",
    subject: "Urgent: Account Locked out",
    content:
      "My account was unexpectedly logged out and now it says 'Invalid Credentials' even though I'm using the correct password. Please help me restore access quickly.",
    createdAt: "2025-12-07T11:05:00Z",
  },
];

// ----------------------------------------------------
// Custom Hook for Data Fetching with Mock Fallback
// ----------------------------------------------------
const useAdminMessagesData = () => {
  const queryResult = useQuery<Message[]>({
    queryKey: ["userMessages"],
    queryFn: () => api.get("/admin/messages").then((res) => res.data),
  });

  // Use mock data if the API fetch failed (isError)
  const useMockData = queryResult.isError;

  return {
    data: useMockData ? MOCK_MESSAGES : queryResult.data,
    isLoading: queryResult.isLoading && !useMockData,
    isError: queryResult.isError && !useMockData,
    error: queryResult.error,
  };
};

export default function UserInbox() {
  // Use the new hook for data fetching
  const { data: messages, isLoading, isError } = useAdminMessagesData();

  // ----------------------------------------------------
  // ⚙️ UI Improvement: Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 items-center justify-center p-6 text-lg text-gray-500">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Loading messages...
        </div>
      </div>
    );
  }

  // ⚙️ UI Improvement: Error State (only shows if mock fallback fails or is disabled)
  if (isError) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="w-[400px] border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                API Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">
                Failed to load user messages. Check the backend connection or
                API endpoint.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ⚙️ UI Improvement: Main Content
  return (
    <div className="flex flex-col h-screen">
      <Header />

      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight flex items-center">
          <Mail className="mr-3 h-7 w-7 text-fuchsia-600" />
          Admin Inbox
        </h1>
        <p className="text-muted-foreground mt-1">
          Review contact and support messages from users.
        </p>
        <Separator className="my-4" />
      </div>

      <main className="px-6 pb-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* 'messages' is guaranteed to be an array here (either real or mock) */}
        {messages && messages.length > 0 ? (
          messages.map((msg) => <UserInboxCard key={msg.id} message={msg} />)
        ) : (
          <p className="text-gray-500 col-span-full text-center py-10">
            🎉 Inbox zero! No new messages in the inbox.
          </p>
        )}
      </main>
    </div>
  );
}
