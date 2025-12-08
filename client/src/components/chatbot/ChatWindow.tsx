import ChatBubble from "./ChatBubble";
import { useChatStore } from "./useChatStore";
import { getBotReply } from "./botLogic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function ChatWindow() {
  const { messages, addMessage, input, setInput } = useChatStore();

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
