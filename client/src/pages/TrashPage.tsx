import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button, Card } from '../components/ui';

interface Entry {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  isDeleted: boolean;
  dateCreated: string;
  lastUpdated: string;
}

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

  if (isLoading) return <div>Loading trash...</div>;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900">Trash</h1>
        <p className="text-sm text-gray-600">
          Items in trash will be permanently deleted after 30 days.
        </p>
      </div>

      {!entries.length && (
        <p className="mt-4 text-sm text-gray-600">nothing to show here</p>
      )}

      <div className="space-y-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{entry.title}</h2>
              <p className="text-xs text-gray-600">{entry.synopsis}</p>
            </div>
            <Button
              className="px-3 py-1 text-xs"
              onClick={() => restoreMutation.mutate(entry.id)}
            >
              Restore
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
