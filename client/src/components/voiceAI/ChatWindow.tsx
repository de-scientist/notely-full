// ChatWindow.tsx
import { useEffect, useRef, useMemo } from "react";
import ChatBubble from "../chatbot/ChatBubble";
import { useChatStore } from "../AI/useChatStore";
import { askNotelyAI } from "@/lib/chats";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, Loader2 } from "lucide-react";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function ChatWindow() {
  const { messages, addMessage, input, setInput, loading, setLoading } =
    useChatStore();

  // Ref is now used to maintain the scroll position anchor for the 'reversed' flow
  const messagesStartRef = useRef<HTMLDivElement>(null);

  const SpeechRecognition = useMemo(
    () =>
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null,
    [],
  );

  // FIX: New useEffect hook to ensure scroll position is maintained at the bottom (start of the reversed list)
  useEffect(() => {
    // Scroll to the 'start' of the reversed list (which is the bottom of the chat view)
    // when messages are loaded initially or when new messages come in.
    if (messagesStartRef.current) {
      messagesStartRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, loading]);
  // NOTE: This effect is still necessary because the ScrollArea component
  // doesn't always automatically manage the flex-col-reverse flow perfectly.

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // --- Speech Recognition Logic (Unchanged functionality) ---
  const startListening = () => {
    if (!SpeechRecognition) {
      addMessage({
        from: "bot",
        text: "Sorry, your browser doesn't support speech recognition.",
      });
      return;
    }

    setLoading(true);

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: any) => {
      setLoading(false);
      const transcript = event.results[0][0].transcript;
      addMessage({ from: "user", text: transcript });
      await sendVoiceQuery(transcript);
    };

    recognition.onerror = (e: any) => {
      setLoading(false);
      addMessage({ from: "bot", text: "Speech recognition error. Try again." });
    };

    recognition.onend = () => {
      if (loading) setLoading(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Recognition start error:", e);
      setLoading(false);
      addMessage({
        from: "bot",
        text: "Could not start mic. Check permissions.",
      });
    }

    return () => recognition.stop();
  };

  const sendVoiceQuery = async (text: string) => {
    setLoading(true);
    try {
      const res = (await askNotelyAI(text, { channel: "voice" })) as any;
      addMessage({ from: "bot", text: res.reply });
      speak(res.reply);
    } catch {
      addMessage({
        from: "bot",
        text: "Sorry, voice assistant couldn't reach the server.",
      });
    }
    setLoading(false);
  };

  // --- Text Input Logic (Unchanged functionality) ---
  const sendTextQuery = async () => {
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    addMessage({ from: "user", text: userQuery });
    setInput("");
    setLoading(true);

    try {
      const res = (await askNotelyAI(userQuery, { channel: "web" })) as any;
      addMessage({ from: "bot", text: res.reply });
      speak(res.reply);
    } catch {
      addMessage({
        from: "bot",
        text: "Sorry, I couldn't connect right now. Try again later.",
      });
    }
    setLoading(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && input.trim()) {
      sendTextQuery();
    }
  };

  return (
    <div className="w-96 h-[480px] bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b bg-gray-50 flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
        <h3 className="font-semibold text-gray-800">Notely AI Assistant</h3>
      </div>

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1">
        {/* FIX: Use flex-col-reverse. This displays items from bottom to top. 
           The user can now freely scroll up to view old history without the 
           scroll snapping constantly. */}
        <div className="p-4 space-y-4 flex flex-col-reverse">
          {/* Scroll anchor placed at the logical "start" (bottom of the viewport) */}
          <div ref={messagesStartRef} className="h-0" />

          {/* Loading Indicator (appears at the bottom, before the scroll anchor) */}
          {loading && (
            <div className="flex items-center space-x-2 text-indigo-500 text-sm p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is typing...</span>
            </div>
          )}

          {/* FIX: Reverse the array to maintain the chronological order in the reversed column flow.
             The latest message (at the end of the array) will render first, 
             placing it at the bottom of the visible area. */}
          {[...messages].reverse().map((m, i) => (
            <ChatBubble key={i} msg={m} />
          ))}
        </div>
      </ScrollArea>

      {/* Input and Action Bar */}
      <div className="p-3 border-t flex gap-2 items-center bg-gray-50">
        {/* Microphone Button (Voice Input) */}
        <Button
          onClick={startListening}
          variant="outline"
          size="icon"
          title="Start voice command"
          className={`shrink-0 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-50"}`}
          disabled={loading}
        >
          <Mic className="h-5 w-5 text-indigo-600" />
        </Button>

        {/* Text Input */}
        <Input
          className="flex-1 border rounded-xl px-4 py-2 text-base focus-visible:ring-indigo-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a query (e.g., 'create a new note')..."
          disabled={loading}
          autoFocus
        />

        {/* Send Button */}
        <Button
          onClick={sendTextQuery}
          disabled={loading || !input.trim()}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
          title="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
