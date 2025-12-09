import { useEffect, useState } from "react";

export default function UserInbox() {
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [selected, setSelected] = useState<any>(null);

  async function load() {
    const res = await fetch("/admin/inbox/all");
    setMessages(await res.json());
  }

  async function sendReply() {
    await fetch("/admin/inbox/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected.userId, replyText: reply }),
    });
    setReply("");
    alert("Reply sent");
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">User Inbox</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white shadow rounded p-4 space-y-4">
          <h3 className="font-bold">Messages</h3>

          {messages.map((m, i) => (
            <div
              key={i}
              className="border p-3 rounded cursor-pointer hover:bg-gray-200"
              onClick={() => setSelected(m)}
            >
              <p className="font-bold">{m.userId}</p>
              <p className="text-sm">{m.text}</p>
            </div>
          ))}
        </div>

        <div className="col-span-2 bg-white shadow rounded p-4">
          {selected ? (
            <>
              <h3 className="font-bold mb-3">Reply to {selected.userId}</h3>
              <textarea
                className="border p-3 w-full h-40"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <button
                onClick={sendReply}
                className="bg-black text-white px-4 py-2 rounded mt-3"
              >
                Send Reply
              </button>
            </>
          ) : (
            <p className="text-gray-500">Select a message to respond.</p>
          )}
        </div>
      </div>
    </div>
  );
}
