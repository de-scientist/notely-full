import { useState } from "react";

export default function RagUploader() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  async function upload() {
    const res = await fetch("/admin/rag/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    setStatus(data.message);
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">RAG Knowledge Base</h2>

      <textarea
        className="w-full h-64 border p-4 rounded"
        placeholder="Paste help docs or instructions..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={upload}
        className="bg-black text-white px-6 py-3 rounded"
      >
        Upload to Vector Store
      </button>

      {status && <p className="text-green-600">{status}</p>}
    </div>
  );
}
