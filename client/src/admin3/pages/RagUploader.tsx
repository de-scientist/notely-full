import { useState } from "react";

export default function RagUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setStatus("Uploading...");
    const res = await fetch("/api/rag/upload", { method: "POST", body: formData });
    if (res.ok) setStatus("Uploaded successfully!");
    else setStatus("Upload failed.");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">RAG Document Upload</h1>
      <input type="file" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={handleUpload} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded">Upload</button>
      {status && <div className="mt-2">{status}</div>}
    </div>
  );
}
