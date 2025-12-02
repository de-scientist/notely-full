import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
// 👇 Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Trash2, FilePenLine, Tag, Loader2 } from 'lucide-react';


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

  if (isLoading) return <div className="mt-16 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (isError || !data?.entry) {
    return <p className="mt-8 text-center text-sm text-muted-foreground">Entry not found or unauthorized.</p>;
  }

  const { entry } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Title and Metadata */}
        <div>
          <h1 className="text-3xl font-bold dark:text-white">{entry.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{entry.synopsis}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                Category: <span className="font-semibold text-primary ml-1">{entry.category.name}</span>
            </span>
            <span>
              Last updated {new Date(entry.lastUpdated).toLocaleString()}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Link to={`/app/notes/${entry.id}/edit`}>
            <Button variant="outline" className="text-gray-800 dark:text-gray-200">
                <FilePenLine className="h-4 w-4 mr-2" />
                Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      {/* Content Card */}
      <Card className="shadow-lg dark:bg-gray-800">
        <CardContent className="p-6">
          {/* In a real app, use a markdown renderer like react-markdown. */}
          <pre className="whitespace-pre-wrap text-base font-mono text-gray-800 dark:text-gray-200">{entry.content}</pre>
        </CardContent>
      </Card>
    </div>
  );
}