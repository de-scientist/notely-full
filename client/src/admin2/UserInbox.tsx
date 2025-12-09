import { useEffect, useState } from "react";
// Import Shadcn/ui components for better UI/UX
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Define the expected type for a message object
type Message = {
    userId: string;
    text: string;
    // Add any other properties your messages might have (e.g., id, timestamp)
    id?: string;
    timestamp?: number;
};

export default function UserInbox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [reply, setReply] = useState("");
    const [selected, setSelected] = useState<Message | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    // --- Data Fetching ---
    async function loadMessages() {
        setIsLoading(true);
        try {
            const res = await fetch("/admin/inbox/all");
            if (!res.ok) throw new Error("Failed to fetch messages.");
            setMessages(await res.json());
        } catch (error) {
            console.error("Load error:", error);
            toast.error("Failed to load user messages.");
        } finally {
            setIsLoading(false);
        }
    }

    // --- Reply Submission ---
    async function sendReply() {
        if (!selected || !reply.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch("/admin/inbox/reply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selected.userId, replyText: reply.trim() }),
            });

            if (!res.ok) throw new Error("Failed to send reply.");

            setReply("");
            toast.success(`Reply sent to ${selected.userId}`);
            
            // Optionally, refresh replies section if you had one, or clear selection
            // setSelected(null); 

        } catch (error) {
            console.error("Send error:", error);
            toast.error("Error sending reply. Please check connection.");
        } finally {
            setIsSending(false);
        }
    }

    useEffect(() => {
        loadMessages();
    }, []);

    return (
        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h2 className="text-3xl font-extrabold text-fuchsia-700 dark:text-fuchsia-500">
                User Inbox Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
                Review user feedback and send direct replies.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Messages List (Col 1) --- */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-5 space-y-4 border dark:border-gray-700">
                    <h3 className="text-xl font-bold border-b pb-2 text-gray-800 dark:text-white">
                        Received Messages ({messages.length})
                    </h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-40 text-fuchsia-600">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading...
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                            {messages.length === 0 ? (
                                <p className="text-gray-500 text-center py-5">No new messages.</p>
                            ) : (
                                messages.map((m) => (
                                    <div
                                        key={m.userId + (m.timestamp || Math.random())}
                                        className={`border p-3 rounded-lg cursor-pointer transition-all ${
                                            selected?.userId === m.userId ? "bg-fuchsia-100 dark:bg-fuchsia-900 border-fuchsia-500 shadow-md" : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                        onClick={() => setSelected(m)}
                                    >
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">User ID: {m.userId}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{m.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* --- Reply Area (Col 2 & 3) --- */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border dark:border-gray-700">
                    {selected ? (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-fuchsia-600 dark:text-fuchsia-400 border-b pb-2">
                                Responding to User ID: {selected.userId}
                            </h3>

                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Original Message:</p>
                                <p className="text-gray-800 dark:text-gray-200 italic">{selected.text}</p>
                            </div>
                            
                            {/* Accessibility Fix implemented here */}
                            <Textarea
                                className="w-full h-40 resize-none text-base p-3 dark:bg-gray-900 dark:border-gray-600"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Type your response here..."
                                // ✅ FIX: Added aria-label for accessibility (Axe/forms rule)
                                aria-label={`Reply text to user ${selected.userId}`}
                                disabled={isSending}
                            />
                            
                            <Button
                                onClick={sendReply}
                                disabled={isSending || reply.trim().length === 0}
                                className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-800 text-white font-semibold shadow-lg w-40"
                            >
                                {isSending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                                    </>
                                ) : (
                                    "Send Reply"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[300px]">
                            <p className="text-gray-500 text-lg">← Select a message from the left panel to draft a response.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}