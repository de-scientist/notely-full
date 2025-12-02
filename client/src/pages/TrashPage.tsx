// 💜 Define OneNote-inspired color palette variables
// We'll use Tailwind's `fuchsia` or `purple` and adjust the shades for the primary color.
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ACCENT_BG_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600";

// 💡 GRADIENT CLASS: Updated to a professional purple/magenta gradient
const GRADIENT_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
// 👇 Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { RotateCcw, Loader2, Tag } from 'lucide-react';


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

  const { data, isLoading } = useQuery<{ entries: Entry[] }>({
    queryKey: ['entries-trash'],
    queryFn: async () => {
      const res = await api.get('/entries/trash');
      return res.data;
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/entries/restore/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
    },
  });

  const entries = data?.entries ?? [];

  if (isLoading) return <div className="mt-16 flex justify-center">{/* 👇 UPDATED: text-primary replaced with fuchsia shade */}<Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_COLOR_CLASS.replace('text', 'text')}`} /></div>;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold dark:text-white">Trash</h1>
        <p className="text-sm text-muted-foreground">
          Items in trash will be permanently deleted after 30 days.
        </p>
      </div>

      {!entries.length && (
        <p className="mt-4 text-lg text-muted-foreground">The trash bin is empty.</p>
      )}

      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="flex items-center justify-between p-4 dark:bg-gray-800">
            <div>
              <h2 className="text-base font-semibold dark:text-white">{entry.title}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                <span className="inline-flex items-center">
                    {/* 👇 UPDATED: Removed text-primary, relying on parent text color or a new fuchsia class */}
                    <Tag className={`h-3 w-3 mr-1 ${PRIMARY_COLOR_CLASS.replace('text', 'text')}`} />
                    {entry.category.name}
                </span>
                <span>| Deleted on {new Date(entry.lastUpdated).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{entry.synopsis}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => restoreMutation.mutate(entry.id)}
              disabled={restoreMutation.isPending}
              className={`border-fuchsia-600 hover:bg-fuchsia-50 dark:border-fuchsia-700 dark:hover:bg-fuchsia-900/50 ${PRIMARY_COLOR_CLASS.replace('text', 'text')}`} // 👇 UPDATED: Apply fuchsia styles to outline button
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}