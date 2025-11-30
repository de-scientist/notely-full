import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
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

export function NotesListPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ entries: Entry[] }>({
    queryKey: ['entries'],
    queryFn: async () => {
      const res = await api.get('/entries');
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
    },
  });

  const entries = data?.entries ?? [];

  if (isLoading) return <div>Loading notes...</div>;

  if (!entries.length) {
    return <p className="mt-8 text-center text-sm text-gray-600">You don&apos;t have any notes yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">My notes</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((entry) => (
          <Card key={entry.id} className="flex flex-col justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">{entry.title}</h2>
              <p className="text-sm text-gray-600">{entry.synopsis}</p>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <span>
                Last updated {new Date(entry.lastUpdated).toLocaleString()}
              </span>
              <div className="flex gap-2">
                <Link to={`/app/notes/${entry.id}`}>
                  <Button className="px-3 py-1 text-xs">Read more</Button>
                </Link>
                <Link to={`/app/notes/${entry.id}/edit`}>
                  <Button className="bg-gray-200 px-3 py-1 text-xs text-gray-800 hover:bg-gray-300">
                    Edit
                  </Button>
                </Link>
                <Button
                  className="bg-red-500 px-3 py-1 text-xs hover:bg-red-600"
                  onClick={() => deleteMutation.mutate(entry.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
