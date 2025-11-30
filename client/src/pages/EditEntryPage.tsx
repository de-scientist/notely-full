import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button, Card, Input, Textarea } from '../components/ui';

interface Entry {
  id: string;
  title: string;
  synopsis: string;
  content: string;
}

export function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ entry: Entry }>({
    queryKey: ['entry', id],
    queryFn: async () => {
      const res = await api.get(`/entries/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.entry) {
      setTitle(data.entry.title);
      setSynopsis(data.entry.synopsis);
      setContent(data.entry.content);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/entries/${id}`, { title, synopsis, content });
      return res.data.entry as Entry;
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entry', id] });
      navigate(`/app/notes/${entry.id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Unable to update entry.';
      setError(msg);
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

  if (isLoading && !data) return <div>Loading...</div>;
  if (!data?.entry) return <p className="mt-8 text-center text-sm text-gray-600">Entry not found.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <h1 className="text-xl font-semibold text-gray-900">Edit entry</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Synopsis</label>
            <Input value={synopsis} onChange={(e) => setSynopsis(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Content (markdown)</label>
            <Textarea
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
