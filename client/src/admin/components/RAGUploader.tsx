import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export default function RAGUploader() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const { data: docs = [], refetch } = useQuery({
    queryKey: ["rag-docs"],
    queryFn: () => fetch("/admin/rag/docs").then(res => res.json()),
  });

  const upload = async () => {
    await fetch("/admin/rag/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text }),
    });

    setTitle("");
    setText("");
    refetch();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">RAG Knowledge Base</h1>

      <div className="space-y-3">
        <input
          placeholder="Document Title"
          className="border px-3 py-2 rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Paste help doc content here..."
          className="border px-3 py-2 rounded w-full h-40"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button onClick={upload}>Upload</Button>
      </div>

      <h2 className="text-xl font-medium mt-10">Uploaded Docs</h2>
      <ul className="list-disc ml-5">
        {docs.map((d) => (
          <li key={d.id}>{d.title}</li>
        ))}
      </ul>
    </div>
  );
}
