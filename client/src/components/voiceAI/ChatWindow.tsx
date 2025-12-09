// ChatWindow.tsx
import { useEffect } from "react";
import ChatBubble from "../chatbot/ChatBubble";
import { useChatStore } from "../AI/useChatStore";
import { askNotelyAI } from "@/lib/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function ChatWindow() {
  const { messages, addMessage, input, setInput, loading, setLoading } =
    useChatStore();

  // Speech recognition setup
  let recognition: any = null;
  const SpeechRecognition =
    typeof window !== "undefined"
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  const startListening = () => {
    if (!SpeechRecognition) {
      addMessage({
        from: "bot",
        text: "Sorry, your browser doesn't support speech recognition.",
      });
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      addMessage({ from: "user", text: transcript });
      await sendVoiceQuery(transcript);
    };

    recognition.onerror = (e: any) => {
      addMessage({ from: "bot", text: "Speech recognition error. Try again." });
    };

    recognition.start();
  };

  const sendVoiceQuery = async (text: string) => {
    setLoading(true);
    try {
      const res = await askNotelyAI(text, { channel: "voice" });
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

  const sendTextQuery = async () => {
    if (!input.trim()) return;
    addMessage({ from: "user", text: input });
    setInput("");
    setLoading(true);

    try {
      const res = await askNotelyAI(input, { channel: "web" });
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

  // TTS
  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    // Optional: tune voice properties
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.cancel(); // stop previous
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border flex flex-col">
      <ScrollArea className="flex-1 p-3 space-y-2">
        {messages.map((m, i) => (
          <ChatBubble key={i} msg={m} />
        ))}
        {loading && <div className="text-gray-400 text-sm">Thinking...</div>}
      </ScrollArea>

      <div className="p-3 flex gap-2 items-center">
        <button
          onClick={startListening}
          className="bg-red-600 text-white p-2 rounded-lg"
          title="Speak"
        >
          🎤
        </button>

        <input
          className="flex-1 border rounded-lg px-3 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask or speak..."
          disabled={loading}
        />

        <Button onClick={sendTextQuery} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
