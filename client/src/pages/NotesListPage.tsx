import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
// 👇 Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "../components/ui/card";
import { Badge } from '../components/ui/badge'; // Assumed component for category tag
import { Loader2, Tag, FilePenLine, Trash2, ArrowRight } from 'lucide-react';


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

  if (isLoading) return <div className="mt-16 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  if (!entries.length) {
    return <p className="mt-8 text-center text-lg text-muted-foreground">You don&apos;t have any active notes yet. Start capturing your ideas!</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">My Notes</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <Card key={entry.id} className="flex flex-col justify-between shadow-md dark:bg-gray-800 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
                <CardTitle className="text-xl dark:text-white">{entry.title}</CardTitle>
                {/* 👇 Category Badge */}
                <Badge variant="secondary" className="w-fit text-xs mt-1 dark:bg-primary/10 dark:text-primary dark:border-primary">
                    <Tag className="h-3 w-3 mr-1" /> {entry.category.name}
                </Badge>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{entry.synopsis}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Updated {new Date(entry.lastUpdated).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <Link to={`/app/notes/${entry.id}/edit`}>
                    <Button variant="outline" size="sm">
                        <FilePenLine className="h-4 w-4" />
                    </Button>
                </Link>
                <Link to={`/app/notes/${entry.id}`}>
                    <Button size="sm">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteMutation.mutate(entry.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}