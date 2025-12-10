import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api"; // your axios/fetch wrapper
import UserInboxCard from "../components/UserInboxCard";
import Header from "../components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Loader2, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// ----------------------------------------------------
// 💡 FIX 1: Define a basic type for the messages
// This is crucial to fix the 'messages is of type unknown' errors (18046)
// Adjust this interface to match your actual API response data
interface Message {
  id: string;
  senderEmail: string;
  subject: string;
  content: string;
  // Add other relevant fields (e.g., createdAt, isRead)
}
// ----------------------------------------------------


export default function UserInbox() {
  // ----------------------------------------------------
  // ✅ FIX 2: Correct useQuery structure and add typing (Error 2769)
  // useQuery now takes an options object { queryKey, queryFn, ... }
  const { 
    data: messages, 
    isLoading, 
    isError 
  } = useQuery<Message[]>({ 
    queryKey: ["userMessages"], 
    queryFn: () => api.get("/admin/messages").then((res) => res.data),
  });
  // ----------------------------------------------------

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

  // ⚙️ UI Improvement: Error State
  if (isError) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 items-center justify-center p-6">
          <Card className="w-[400px] border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">Failed to load user messages. Check the backend connection or API endpoint.</p>
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
        <p className="text-muted-foreground mt-1">Review contact and support messages from users.</p>
        <Separator className="my-4" />
      </div>

      <main className="px-6 pb-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Check if messages is defined and is an array before checking length */}
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            // The type is now correctly inferred as Message, removing the 'any' cast
            <UserInboxCard key={msg.id} message={msg} />
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center py-10">
            🎉 Inbox zero! No new messages in the inbox.
          </p>
        )}
      </main>
    </div>
  );
}