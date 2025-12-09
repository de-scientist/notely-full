import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, Upload, Plus, List, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// Define the expected type for a RAG Document object
type RagDocument = {
    id: string;
    title: string;
    source: string | null;
    createdAt: string; // ISO Date String
};

// Define the Fuchsia text class for re-use
const FUCHSIA_TEXT_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";

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
        <div className="p-6 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen rounded-xl">
            <header className="space-y-2">
                <h1 className={`text-4xl font-extrabold ${FUCHSIA_TEXT_CLASS}`}>
                    RAG Knowledge Base Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Manage the documents and content used by the AI assistant for contextual answers.
                </p>
            </header>

            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[450px] mb-8 bg-white dark:bg-gray-800 p-1 shadow-md rounded-lg">
                    <TabsTrigger 
                        value="upload" 
                        className={`flex items-center gap-2 text-base font-semibold transition-all data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white ${FUCHSIA_TEXT_CLASS}`}
                    >
                        <Plus className="w-4 h-4" /> Add New Content
                    </TabsTrigger>
                    <TabsTrigger 
                        value="list" 
                        className={`flex items-center gap-2 text-base font-semibold transition-all data-[state=active]:bg-fuchsia-600 data-[state=active]:text-white ${FUCHSIA_TEXT_CLASS}`}
                    >
                        <List className="w-4 h-4" /> View Indexed Docs ({docs.length})
                    </TabsTrigger>
                </TabsList>

                {/* --- Tab 1: Upload Form --- */}
                <TabsContent value="upload" className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border dark:border-gray-700">
                    <div className="space-y-6">
                        <h2 className={`text-2xl font-bold border-b pb-3 ${FUCHSIA_TEXT_CLASS}`}>Paste Document or Text</h2>
                        
                        <Input
                            placeholder="Document Title (e.g., 'Notely Pricing Guide')"
                            className="text-lg p-3 h-12 border-gray-300 dark:border-gray-700"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploadMutation.isPending}
                            aria-label="Document Title"
                        />

                        <Textarea
                            placeholder="Paste the raw text content here (max 10,000 chars recommended)..."
                            className="w-full h-80 text-base p-4 resize-y border-gray-300 dark:bg-gray-900 dark:border-gray-700"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            disabled={uploadMutation.isPending}
                            aria-label="Document Content"
                        />
                        
                        <div className="flex justify-between items-center pt-4">
                             <p className="text-sm text-gray-500 dark:text-gray-400">
                                This process vectorizes the text for the AI's knowledge base and may take a few moments.
                            </p>
                            <Button 
                                onClick={handleUpload} 
                                disabled={uploadMutation.isPending || !title.trim() || !text.trim()}
                                className="bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-800 text-white font-semibold transition-colors w-52 h-10 shadow-lg"
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
                <TabsContent value="list" className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl border dark:border-gray-700">
                    <h2 className={`text-2xl font-bold mb-6 border-b pb-3 ${FUCHSIA_TEXT_CLASS}`}>Indexed Documents List</h2>

                    {isLoading && (
                        <div className="flex items-center justify-center h-40 text-fuchsia-600">
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" /> <span className="text-lg">Loading document list...</span>
                        </div>
                    )}
                    
                    {error && <p className="p-4 bg-red-50 text-red-700 border border-red-300 rounded-lg text-sm">Failed to load documents. Please check the server connection.</p>}
                    
                    {!isLoading && docs.length === 0 && !error && (
                        <div className="text-center text-gray-500 py-12 border border-dashed rounded-lg dark:border-gray-700">
                            <List className="w-8 h-8 mx-auto mb-3" />
                            <p>No documents have been indexed yet. Start by adding content.</p>
                        </div>
                    )}

                    {!isLoading && docs.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
                            <Table>
                                <TableHeader className="bg-gray-100 dark:bg-gray-700">
                                    <TableRow className="dark:hover:bg-gray-700">
                                        <TableHead className="w-[400px] text-gray-700 dark:text-gray-200 text-sm font-bold uppercase tracking-wider">Title</TableHead>
                                        <TableHead className="text-gray-700 dark:text-gray-200 text-sm font-bold uppercase tracking-wider">Source</TableHead>
                                        <TableHead className="w-[180px] text-gray-700 dark:text-gray-200 text-sm font-bold uppercase tracking-wider">Date Indexed</TableHead>
                                        <TableHead className="text-right text-gray-700 dark:text-gray-200 text-sm font-bold uppercase tracking-wider">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {docs.map((d) => (
                                        <TableRow key={d.id} className="dark:hover:bg-gray-700/50">
                                            <TableCell className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-3 py-4">
                                                <FileText className={`h-4 w-4 ${FUCHSIA_TEXT_CLASS}`} />
                                                {d.title}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                                                {d.source || 'Manual Input'}
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
                                                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableCaption className="dark:text-gray-400 pt-4">
                                    A list of all indexed RAG documents available to the AI.
                                </TableCaption>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}