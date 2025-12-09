// src/admin/RagUploader.tsx
import { useState } from "react";

export default function RagUploader() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onUpload() {
    if (!title || !content) return setMsg("title and content required");
    setLoading(true);
    try {
      const res = await fetch("/api/rag/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, source: "help" }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg("Uploaded: " + d.doc.id);
        setTitle(""); setContent("");
      } else {
        setMsg(d.error || "upload failed");
      }
    } catch (e) {
      setMsg("error uploading");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <h3 className="font-semibold">Upload Help Doc</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border p-2 w-full rounded" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" className="border p-2 w-full rounded h-40" />
      <div className="flex gap-2">
        <button onClick={onUpload} className="bg-black text-white px-3 py-1 rounded" disabled={loading}>Upload</button>
        <div className="text-sm text-gray-600">{msg}</div>
      </div>
    </div>
  );
}
