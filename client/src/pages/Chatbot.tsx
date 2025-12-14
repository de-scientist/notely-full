// Chatbot.tsx
import { useState } from "react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I’m Notely Assistant. How can I help you?" },
  ]);
  const [input, setInput] = useState("");

  const botResponses: Record<string, string> = {
    create: "To create a note, click the 'New Note' button.",
    bookmark: "Tap the star icon at the top of a note to bookmark it.",
    edit: "Open a note, then click the Edit button.",
    delete: "Open a note and click the trash icon.",
    list: "Your notes appear on the homepage. You can open any to view or edit.",
  };

  const handleSend = () => {
    if (!input) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const key = Object.keys(botResponses).find((k) =>
      input.toLowerCase().includes(k),
    );

    const botReply = key
      ? botResponses[key]
      : "I’m not sure I understand. Try asking about creating, editing, deleting, or bookmarking notes.";

    setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6">
      {open && (
        <div className="w-72 bg-white rounded-xl shadow-xl p-4 mb-3 border">
          <div className="h-64 overflow-y-auto space-y-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  m.from === "bot" ? "bg-gray-200" : "bg-blue-200 text-right"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 border rounded-lg px-2 py-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="bg-black text-white p-4 rounded-full shadow-lg"
      >
        💬
      </button>
    </div>
  );
}
