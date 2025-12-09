import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, Upload, Plus } from 'lucide-react'; // Assuming lucide icons are available

// FIX 1: Define the expected type for a RAG Document object
type RagDocument = {
  id: string;
  title: string;
  source: string | null;
  createdAt: string; // ISO Date String
};

export default function RAGUploader() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const queryClient = useQueryClient();

  // --- Data Fetching: List Documents ---
  const { data: docs = [], isLoading, error } = useQuery<RagDocument[]>({
    queryKey: ["rag-docs"],
    queryFn: () => fetch("/admin/rag/docs").then(res => res.json()),
  });

  // --- Data Mutation: Upload Document ---
  const uploadMutation = useMutation({
    mutationFn: (newDoc: { title: string; text: string }) => 
        fetch("/admin/rag/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDoc),
        }).then(res => {
            if (!res.ok) throw new Error("Upload failed");
            return res.json();
        }),
    onSuccess: () => {
      // Invalidate the query to refetch the updated list
      queryClient.invalidateQueries({ queryKey: ["rag-docs"] });
      setTitle("");
      setText("");
    },
    onError: (err) => {
        console.error("Upload error:", err);
        // Implement better error feedback (e.g., toast)
    }
  });

  const handleUpload = () => {
    if (title.trim() && text.trim()) {
        uploadMutation.mutate({ title: title.trim(), text: text.trim() });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">RAG Knowledge Base Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Uploader Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-700">
            <Plus className="w-5 h-5 mr-2" /> Add New Document
          </h2>
          
          <div className="space-y-4">
            <Input
              placeholder="Document Title (e.g., 'Notely Pricing & Billing')"
              className="px-4 py-2 text-lg focus:ring-indigo-500 focus:border-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploadMutation.isPending}
              aria-label="Document Title"
            />

            <Textarea
              placeholder="Paste help doc content here... (This content will be vectorized and used for RAG)"
              className="px-4 py-2 w-full h-64 focus:ring-indigo-500 focus:border-indigo-500 resize-y"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={uploadMutation.isPending}
              aria-label="Document Content"
            />

            <Button 
              onClick={handleUpload} 
              disabled={uploadMutation.isPending || !title.trim() || !text.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors w-full"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document and Embed
                </>
              )}
            </Button>
            {uploadMutation.isError && <p className="text-red-500 text-sm mt-2">Error uploading document. Check server logs.</p>}
            {uploadMutation.isSuccess && <p className="text-green-600 text-sm mt-2">Document uploaded successfully!</p>}
          </div>
        </div>

        {/* Right Column: Uploaded Docs List */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {`Uploaded Docs (${docs.length})`}
          </h2>
          
          {isLoading && (
            <div className="flex items-center text-indigo-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading list...
            </div>
          )}
          
          {error && <p className="text-red-500 text-sm">Failed to load documents.</p>}

          <ul className="space-y-3">
            {docs.map((d) => (
              <li 
                key={d.id} 
                className="flex items-start p-3 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FileText className="w-5 h-5 mt-1 mr-3 text-indigo-500 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">{d.title}</div>
                  <div className="text-xs text-gray-500">
                    Source: {d.source || 'Manual Upload'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </div>
  );
}