import ChatBubble from "./ChatBubble";
import { useChatStore } from "./useChatStore";
import { askNotelyAI } from "@/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function ChatWindow() {
  const { messages, addMessage, input, setInput, loading, setLoading } =
    useChatStore();

  const send = async () => {
    if (!input.trim()) return;

    addMessage({ from: "user", text: input });
    const question = input;
    setInput("");

    setLoading(true);

    try {
      const { reply } = await askNotelyAI(question);
      addMessage({ from: "bot", text: reply });
    } catch {
      addMessage({
        from: "bot",
        text: "Sorry, I couldn't connect right now. Try again later.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border flex flex-col">
      <ScrollArea className="flex-1 p-3 space-y-2">
        {messages.map((m, i) => (
          <ChatBubble key={i} msg={m} />
        ))}

        {loading && (
          <div className="text-gray-400 text-sm">Thinking...</div>
        )}
      </ScrollArea>

      <div className="p-3 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          disabled={loading}
        />
        <Button onClick={send} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
