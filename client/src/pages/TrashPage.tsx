import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
// 👇 Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { RotateCcw, Loader2, Tag, Trash2, Zap, AlertTriangle } from 'lucide-react';

// 💜 Define OneNote-inspired color palette variables
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ACCENT_BG_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600";
const GRADIENT_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";

// ------------------------------------
// Updated Entry Type
// ------------------------------------
interface Entry {
    id: string;
    title: string;
    synopsis: string;
    content: string;
    isDeleted: boolean;
    dateCreated: string;
    lastUpdated: string;
    category: { // Category included via API include
        name: string;
    }
}
// ------------------------------------


export function TrashPage() {
    const queryClient = useQueryClient();

    // --- 1. Fetch Trash Data ---
    const { data, isLoading } = useQuery<{ entries: Entry[] }>({
        queryKey: ['entries-trash'],
        queryFn: async () => {
            const res = await api.get('/entries/trash');
            return res.data;
        },
    });

    const entries = data?.entries ?? [];

    // --- 2. Mutations ---
    const restoreMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.patch(`/entries/restore/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
        },
    });

    // 🟢 Permanent Delete Mutation (Single Item)
    const permanentDeleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/entries/permanent/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
        },
    });

    // 🟢 Permanent Delete Mutation (All Items)
    const emptyTrashMutation = useMutation({
        mutationFn: async () => {
            await api.delete('/entries/empty-trash');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
        },
    });

    // --- 3. Loading State ---
    if (isLoading) return (
        <div className="mt-16 flex justify-center">
            <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_COLOR_CLASS.replace('text', 'text')}`} />
        </div>
    );
    
    // --- 4. Empty State (Improved UX) ---
    if (!entries.length) return (
        <div className="mt-16 flex flex-col items-center justify-center text-center space-y-6 p-8 border-2 border-dashed border-fuchsia-300 dark:border-fuchsia-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
            <Trash2 className={`h-16 w-16 text-fuchsia-500`} />
            <h2 className="text-3xl font-bold dark:text-white">Trash is Empty! 🎉</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                Your trash bin is currently clean. Any notes you delete will appear here before their final deletion.
            </p>
            <p className={`text-sm ${PRIMARY_COLOR_CLASS}`}>
                Items are permanently removed after 30 days.
            </p>
        </div>
    );

    // --- 5. Main Content ---
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center pb-2 border-b dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold dark:text-white">Trash ({entries.length} items)</h1>
                    <p className="text-sm text-muted-foreground">
                        Items in trash will be permanently deleted after 30 days.
                    </p>
                </div>
                
                {/* 🟢 Empty Trash CTA */}
                <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => emptyTrashMutation.mutate()}
                    disabled={emptyTrashMutation.isPending}
                    className="flex items-center gap-1 shadow-md shadow-red-500/30"
                >
                    {emptyTrashMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Zap className="h-4 w-4" />
                    )}
                    Empty Trash
                </Button>
            </div>
            
            <div className="space-y-4">
                {entries.map((entry) => (
                    <Card 
                        key={entry.id} 
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 dark:bg-gray-800 transition-shadow hover:shadow-lg border-l-4 border-red-500 dark:border-red-700"
                    >
                        {/* Card Content Area */}
                        <div className="flex-1 min-w-0 pr-4 space-y-1 mb-3 sm:mb-0">
                            <CardTitle className="text-lg font-semibold dark:text-white line-clamp-1">{entry.title}</CardTitle>
                            <CardDescription className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                <span className="inline-flex items-center font-medium">
                                    <Tag className={`h-3 w-3 mr-1 ${PRIMARY_COLOR_CLASS.replace('text', 'text')}`} />
                                    {entry.category.name}
                                </span>
                                <span>| Deleted on {new Date(entry.lastUpdated).toLocaleDateString()}</span>
                            </CardDescription>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{entry.synopsis}</p>
                        </div>

                        {/* 🟢 Action Buttons (Well-Aligned) */}
                        <div className="flex space-x-2 flex-shrink-0">
                            {/* Restore Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => restoreMutation.mutate(entry.id)}
                                disabled={restoreMutation.isPending}
                                className={`
                                    flex items-center border-fuchsia-600 hover:bg-fuchsia-50 dark:border-fuchsia-700 
                                    dark:hover:bg-fuchsia-900/50 ${PRIMARY_COLOR_CLASS}
                                `}
                            >
                                {restoreMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                )}
                                Restore
                            </Button>
                            
                            {/* 🟢 Permanently Delete Button */}
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => permanentDeleteMutation.mutate(entry.id)}
                                disabled={permanentDeleteMutation.isPending}
                                title="Permanently Delete Note"
                                className="flex items-center"
                            >
                                {permanentDeleteMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
            
            {/* ⚠️ Footer Warning */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>
                    **Warning:** Permanently deleting an item removes it forever and cannot be undone. Use the Empty Trash button with caution.
                </span>
            </div>
        </div>
    );
}