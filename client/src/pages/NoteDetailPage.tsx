import { useParams, Link, useNavigate } from 'react-router-dom';
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

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<{ entry: Entry }>({
    queryKey: ['entry', id],
    queryFn: async () => {
      const res = await api.get(`/entries/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await api.delete(`/entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
      navigate('/app/notes');
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data?.entry) {
    return <p className="mt-8 text-center text-sm text-gray-600">Entry not found.</p>;
  }

  const { entry } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{entry.title}</h1>
          <p className="mt-1 text-sm text-gray-600">{entry.synopsis}</p>
          <p className="mt-1 text-xs text-gray-500">
            Last updated {new Date(entry.lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/app/notes/${entry.id}/edit`}>
            <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300">Edit</Button>
          </Link>
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => deleteMutation.mutate()}
          >
            Delete
          </Button>
        </div>
      </div>
      <Card>
        {/* In a real app, use a markdown renderer like react-markdown. For now we render as preformatted text. */}
        <pre className="whitespace-pre-wrap text-sm text-gray-800">{entry.content}</pre>
      </Card>
    </div>
  );
}
