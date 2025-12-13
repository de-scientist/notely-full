import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
// 👇 Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "../components/ui/card";
import { RotateCcw, Loader2, Tag, Trash2, Zap, AlertTriangle, Clock } from 'lucide-react';

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
    lastUpdated: string; // This is the date the item was marked as deleted
    category: { // Category included via API include
        name: string;
    }
}
// ------------------------------------

/**
 * Helper function to calculate days remaining until permanent deletion (30 days).
 */
function getDaysUntilPermanentDelete(lastUpdated: string): { deletedOn: string, daysRemaining: number } {
    const deletedDate = new Date(lastUpdated);
    const expirationDate = new Date(deletedDate);
    // Items are permanently removed after 30 days
    expirationDate.setDate(deletedDate.getDate() + 30);
    
    const now = new Date();
    
    // Calculate difference in milliseconds
    const timeDiff = expirationDate.getTime() - now.getTime();
    // Convert to days, rounding up to ensure the day of deletion counts
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return {
        deletedOn: deletedDate.toLocaleDateString(),
        daysRemaining: Math.max(0, daysRemaining), // Ensure it's not negative
    };
}


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

    // Sort entries by lastUpdated date descending (most recently deleted first)
    const entries = (data?.entries ?? [])
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

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
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold dark:text-white flex items-center gap-3">
                        <Trash2 className={`h-8 w-8 ${PRIMARY_COLOR_CLASS}`} /> Trash ({entries.length} items)
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Review and restore notes. Items are permanently removed 30 days after deletion.
                    </p>
                </div>
                
                {/* 🟢 Empty Trash CTA */}
                <Button 
                    variant="destructive"
                    size="lg"
                    onClick={() => emptyTrashMutation.mutate()}
                    disabled={emptyTrashMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 text-base font-semibold shadow-xl shadow-red-500/40 transition-all duration-300 transform hover:scale-[1.03]"
                >
                    {emptyTrashMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Zap className="h-5 w-5" />
                    )}
                    Empty Trash Now
                </Button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => {
                    const { deletedOn, daysRemaining } = getDaysUntilPermanentDelete(entry.lastUpdated);
                    
                    // Determine warning color for days remaining
                    let daysClass = "text-green-600 dark:text-green-400";
                    if (daysRemaining <= 7) {
                        daysClass = "text-yellow-600 dark:text-yellow-400";
                    }
                    if (daysRemaining <= 3) {
                        daysClass = "text-red-600 dark:text-red-400";
                    }

                    return (
                        <Card 
                            key={entry.id} 
                            className="flex flex-col dark:bg-gray-800 transition-shadow hover:shadow-2xl border-l-4 border-red-500 dark:border-red-700"
                        >
                            {/* 1. Card Header (Title & Category) */}
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xl font-semibold dark:text-white line-clamp-1">{entry.title}</CardTitle>
                                <CardDescription className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    <span className={`inline-flex items-center font-medium p-1 rounded-sm bg-fuchsia-50 dark:bg-fuchsia-900/30 ${PRIMARY_COLOR_CLASS}`}>
                                        <Tag className="h-3 w-3 mr-1" />
                                        {entry.category.name}
                                    </span>
                                </CardDescription>
                            </CardHeader>

                            {/* 2. Card Content (Synopsis & Expiration) */}
                            <CardContent className="pt-0 pb-4 flex-1">
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{entry.synopsis || "No synopsis available."}</p>
                                
                                {/* Expiration Time */}
                                <div className="text-sm border-t pt-3 dark:border-gray-700">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        <Trash2 className="h-4 w-4 mr-1 inline-block text-red-500" />
                                        **Deleted:** {deletedOn}
                                    </p>
                                    <p className={`font-semibold mt-1 flex items-center gap-1 ${daysClass}`}>
                                        <Clock className="h-4 w-4" />
                                        {daysRemaining === 0 
                                            ? 'Scheduled for permanent deletion today.' 
                                            : `Permanently deleted in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}.`
                                        }
                                    </p>
                                </div>
                            </CardContent>

                            {/* 3. Card Footer (Actions) */}
                            <CardFooter className="flex items-center justify-end pt-4 border-t dark:border-gray-700">
                                
                                <div className="flex space-x-3 flex-shrink-0">
                                    {/* Restore Button */}
                                    <Button
                                        size="sm"
                                        onClick={() => restoreMutation.mutate(entry.id)}
                                        disabled={restoreMutation.isPending || permanentDeleteMutation.isPending}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold 
                                            ${ACCENT_BG_CLASS} shadow-md shadow-fuchsia-500/30 transition-all
                                        `}
                                    >
                                        {restoreMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RotateCcw className="h-4 w-4" />
                                        )}
                                        Restore
                                    </Button>
                                    
                                    {/* Permanently Delete Button */}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => permanentDeleteMutation.mutate(entry.id)}
                                        disabled={permanentDeleteMutation.isPending || restoreMutation.isPending}
                                        title="Permanently Delete Note"
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg shadow-md shadow-red-500/30 transition-all"
                                    >
                                        {permanentDeleteMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                        Delete
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            
            {/* ⚠️ Footer Warning */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-center gap-2 mt-8">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">
                    **Warning:** Permanently deleting an item removes it forever and **cannot be undone**. Items are automatically removed after 30 days.
                </span>
            </div>
        </div>
    );
}