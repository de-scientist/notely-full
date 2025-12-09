import ChatBubble from "../chatbot/ChatBubble";
import { useChatStore } from "./useChatStore";
import { askNotelyAI } from "@/lib/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react"; // Import hooks for auto-scrolling

export default function ChatWindow() {
  // Assuming loading and setLoading have been added to the ChatState interface and useChatStore
  const { messages, addMessage, input, setInput, loading, setLoading } =
    useChatStore();
    
  // Ref to hold the scrollable element DOM node
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to the bottom whenever a new message is added
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Find the viewport element managed by ScrollArea (often the direct child)
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      } else {
        // Fallback or simplified scroll if the radix component structure changes
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  }, [messages.length]); // Re-run effect whenever the message count changes

  const send = async () => {
    if (!input.trim()) return;

    addMessage({ from: "user", text: input });
    const question = input;
    setInput("");

    setLoading(true);

    try {
      // FIX: Changed destructuring to assign the returned string directly to 'reply'
      const reply = await askNotelyAI(question);
      addMessage({ from: "bot", text: reply });
    } catch {
      addMessage({
        from: "bot",
        text: "Sorry, I couldn't connect right now. Try again later.",
      });
    }

    setLoading(false);
  };

  // Function to allow sending on Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      send();
    }
  };

  return (
    <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border flex flex-col">
      
      {/* Design Improvement: Add a Header */}
      <div className="p-3 border-b bg-gray-50 rounded-t-2xl">
        <h3 className="font-semibold text-lg text-black">Notely AI Assistant 🤖</h3>
        <p className="text-xs text-gray-500">Ask about app features and navigation.</p>
      </div>

      {/* Attach the ref to the ScrollArea for auto-scrolling */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-3 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <ChatBubble key={i} msg={m} />
        ))}

        {loading && (
          <div className="text-gray-400 text-sm italic py-1">Thinking...</div>
        )}
      </ScrollArea>

      <div className="p-3 flex gap-2 border-t">
        <input
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:border-blue-500 transition-colors"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown} // Enable sending on Enter
          placeholder="Ask something..."
          disabled={loading}
        />
        <Button 
          onClick={send} 
          disabled={loading || !input.trim()} // Disable send button if input is empty
          className="rounded-full px-4"
        >
          {loading ? '...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}