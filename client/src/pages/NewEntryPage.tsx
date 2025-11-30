import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Button, Card, Input, Textarea } from '../components/ui';

export function NewEntryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/entries', { title, synopsis, content });
      return res.data.entry as { id: string };
    },
    onSuccess: (entry) => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      navigate(`/app/notes/${entry.id}`);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Unable to create entry.';
      setError(msg);
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <h1 className="text-xl font-semibold text-gray-900">New entry</h1>
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
            {mutation.isPending ? 'Saving...' : 'Create entry'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
