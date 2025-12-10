import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api"; // your axios/fetch wrapper
import UserInboxCard from "../components/UserInboxCard";
import Header from "../components/Header";

export default function UserInbox() {
  const { data: messages, isLoading, isError } = useQuery(["userMessages"], () =>
    api.get("/admin/messages").then((res) => res.data)
  );

  if (isLoading) return <div className="p-6">Loading messages...</div>;
  if (isError) return <div className="p-6 text-red-600">Failed to load messages.</div>;

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="p-6 overflow-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 col-span-full">No messages in the inbox.</p>
        ) : (
          messages.map((msg: any) => <UserInboxCard key={msg.id} message={msg} />)
        )}
      </main>
    </div>
  );
}
