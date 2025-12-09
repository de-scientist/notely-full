import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, Upload, Plus, List, Trash2 } from 'lucide-react';
// ✅ FIX: Replace Shadcn's useToast with Sonner's toast function
import { toast } from 'sonner';

// Define the expected type for a RAG Document object
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
    // ❌ REMOVED: const { toast } = useToast(); 
    // We now use the imported Sonner 'toast' directly.

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
            queryClient.invalidateQueries({ queryKey: ["rag-docs"] });
            setTitle("");
            setText("");
            // ✅ SONNER UPDATE: Use toast.success
            toast.success("Document Indexed", {
                description: `Content for '${title}' has been successfully vectorized.`,
                duration: 3000,
                icon: '📚',
            });
        },
        onError: (err) => {
            console.error("Upload error:", err);
            // ✅ SONNER UPDATE: Use toast.error
            toast.error("Upload Failed", {
                description: err instanceof Error ? err.message : "An unknown error occurred during indexing.",
                duration: 5000,
            });
        }
    });

    // --- Data Mutation: Delete Document (New UX Feature) ---
    const deleteMutation = useMutation({
        mutationFn: (docId: string) => 
            fetch(`/admin/rag/doc/${docId}`, { method: "DELETE" })
            .then(res => {
                if (!res.ok) throw new Error("Deletion failed");
                return res.json();
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rag-docs"] });
            // ✅ SONNER UPDATE: Use toast.info or toast.message
            toast.info("Document Removed", {
                description: "The knowledge document has been removed from the RAG index.",
                duration: 3000,
                icon: '🗑️',
            });
        },
        onError: (err) => {
            // ✅ SONNER UPDATE: Use toast.error
            toast.error("Deletion Failed", {
                description: "Could not delete document. Check server connection.",
            });
        }
    });

    const handleUpload = () => {
        if (title.trim() && text.trim()) {
            uploadMutation.mutate({ title: title.trim(), text: text.trim() });
        }
    };

    const handleDelete = (docId: string) => {
        // Use Sonner to replace the native `confirm` box for a better look
        toast.warning("Confirm Deletion", {
            description: "Are you sure you want to delete this document? This will remove it from the RAG knowledge base.",
            duration: 5000, // Give user time to see the action
            action: {
                label: 'Delete',
                onClick: () => deleteMutation.mutate(docId),
            },
            cancel: {
                label: 'Cancel',
                onClick: () => toast.dismiss(),
            }
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">
                RAG Knowledge Base Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
                Manage the documents and content used by the AI assistant for contextual answers.
            </p>

            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-96 mb-6 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white">
                        <Plus className="w-4 h-4" /> Add New Content
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white">
                        <List className="w-4 h-4" /> View Indexed Docs ({docs.length})
                    </TabsTrigger>
                </TabsList>

                {/* --- Tab 1: Upload Form --- */}
                <TabsContent value="upload" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Paste Document or Text</h2>
                        <Input
                            placeholder="Document Title (e.g., 'Notely Pricing Guide')"
                            className="text-lg"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploadMutation.isPending}
                            aria-label="Document Title"
                        />

                        <Textarea
                            placeholder="Paste the raw text content here (max 10,000 chars recommended)..."
                            className="w-full h-80 text-base resize-y dark:bg-gray-900"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={uploadMutation.isPending}
                            aria-label="Document Content"
                        />
                        
                        <div className="flex justify-between items-center pt-2">
                             <p className="text-sm text-gray-500 dark:text-gray-400">
                                This process vectorizes the text for the AI's knowledge base.
                            </p>
                            <Button 
                                onClick={handleUpload} 
                                disabled={uploadMutation.isPending || !title.trim() || !text.trim()}
                                className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-800 text-white font-semibold transition-colors w-48"
                            >
                                {uploadMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Indexing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload & Index
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* --- Tab 2: Document List (Using Shadcn Table) --- */}
                <TabsContent value="list" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Indexed Documents List</h2>

                    {isLoading && (
                        <div className="flex items-center justify-center h-40 text-fuchsia-600">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading document list...
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-sm">Failed to load documents.</p>}
                    
                    {!isLoading && docs.length === 0 && !error && (
                        <p className="text-center text-gray-500 py-10 border rounded-lg dark:border-gray-700">
                            No documents have been indexed yet. Start by adding content in the 'Add New Content' tab.
                        </p>
                    )}

                    {!isLoading && docs.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow className="dark:hover:bg-gray-800">
                                    <TableHead className="w-[400px]">Title</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead className="w-[150px]">Date Indexed</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {docs.map((d) => (
                                    <TableRow key={d.id} className="dark:hover:bg-gray-800/50">
                                        <TableCell className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-fuchsia-500" />
                                            {d.title}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {d.source || 'Manual'}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(d.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleDelete(d.id)}
                                                disabled={deleteMutation.isPending}
                                                title="Delete Document"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableCaption className="dark:text-gray-400">A list of all indexed RAG documents.</TableCaption>
                        </Table>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}