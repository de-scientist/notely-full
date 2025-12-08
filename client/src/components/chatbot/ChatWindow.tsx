import ChatBubble from "./ChatBubble";
import { createChatStore } from "./useChatStore"; // Import the factory function
import { getBotReply } from "./botLogic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// Define a type for the initialized store hook for clean typing
// The store hook is of type ReturnType<typeof createChatStore> but called when used.
// We'll type the prop as any for simplicity, but in a real app, it would be a specific type.
type UseChatStoreHook = ReturnType<typeof createChatStore>;

// The ChatWindow component now accepts the initialized store hook as a prop.
interface ChatWindowProps {
    useStore: UseChatStoreHook;
}

export default function ChatWindow({ useStore }: ChatWindowProps) {
  // Use the initialized store hook passed via props
  const { messages, addMessage, input, setInput } = useStore();

  const send = () => {
    if (!input.trim()) return;

    addMessage({ from: "user", text: input });

    const reply = getBotReply(input);
    setTimeout(() => {
      addMessage({ from: "bot", text: reply });
    }, 200);

    setInput("");
  };

  return (
    <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border flex flex-col">
      <ScrollArea className="flex-1 p-3 space-y-2">
        {messages.map((m, i) => (
          <ChatBubble key={i} msg={m} />
        ))}
      </ScrollArea>

      <div className="p-3 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  );
}

// --- Example of how the ChatWindow would be used in a parent component ---
/*
// In a parent component (e.g., App.tsx) where the userName is known:

import { createChatStore } from './useChatStore';

// 1. Get the current user's name (e.g., from an auth context)
const currentUserName = "Alex"; 

// 2. Initialize the store hook once
const useChatStoreHook = createChatStore(currentUserName);

function ParentComponent() {
    return <ChatWindow useStore={useChatStoreHook} />;
}
*/