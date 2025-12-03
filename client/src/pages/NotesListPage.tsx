import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "../components/ui/card";
import { Badge } from '../components/ui/badge';
import { Loader2, Tag, FilePenLine, Trash2, ArrowRight, PlusCircle, Star, StarOff } from 'lucide-react';

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const SOLID_BUTTON_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-md shadow-fuchsia-500/50";
const CTA_BUTTON_CLASS = "bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-lg px-4 py-2 shadow-md shadow-fuchsia-400/40 transition transform hover:scale-[1.03]";

interface Entry {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  isDeleted: boolean;
  pinned: boolean;
  dateCreated: string;
  lastUpdated: string;
  category: { name: string };
}

export function NotesListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ entries: Entry[] }>({
    queryKey: ['entries'],
    queryFn: async () => {
      const res = await api.get('/entries');
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['entries-trash'] });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      await api.patch(`/entries/${id}`, { pinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
  });

  const entries = data?.entries ?? [];

  if (isLoading) return (
    <div className="mt-16 flex justify-center">
      <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
    </div>
  );

  // No notes state with CTA
  if (!entries.length) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center text-center space-y-4">
        <PlusCircle className="h-12 w-12 text-fuchsia-500 animate-bounce" />
        <h2 className="text-2xl font-semibold dark:text-white">No Notes Yet</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
          You haven&apos;t created any notes yet. Click below to start capturing your ideas!
        </p>
        <Button className={CTA_BUTTON_CLASS} onClick={() => navigate('/app/notes/new')}>
          Create a New Note
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">My Notes</h1>
        <Button
          className={`${CTA_BUTTON_CLASS} flex items-center gap-2`}
          onClick={() => navigate('/app/notes/new')}
        >
          <PlusCircle className="h-5 w-5" /> New Note
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className={`flex flex-col justify-between shadow-md dark:bg-gray-800 transition-all hover:shadow-lg hover:scale-[1.01] ${
              entry.pinned ? 'border-2 border-fuchsia-500' : ''
            }`}
          >
            <CardHeader className="pb-3 flex justify-between items-start">
              <div>
                <CardTitle className="text-xl dark:text-white">{entry.title}</CardTitle>
                <Badge
                  variant="secondary"
                  className={`w-fit text-xs mt-1 dark:bg-fuchsia-900/20 ${PRIMARY_TEXT_CLASS} border-fuchsia-600 dark:border-fuchsia-500`}
                >
                  <Tag className="h-3 w-3 mr-1" /> {entry.category.name}
                </Badge>
              </div>
              <div className="cursor-pointer" onClick={() => togglePinMutation.mutate({ id: entry.id, pinned: !entry.pinned })}>
                {entry.pinned ? (
                  <Star className="h-5 w-5 text-yellow-400" />
                ) : (
                  <StarOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-3">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {entry.synopsis || entry.content.slice(0, 120) + (entry.content.length > 120 ? '...' : '')}
              </p>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Updated {new Date(entry.lastUpdated).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <Link to={`/app/notes/${entry.id}/edit`}>
                  <Button variant="outline" size="sm" className="transition-transform hover:scale-105">
                    <FilePenLine className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/app/notes/${entry.id}`}>
                  <Button size="sm" className={SOLID_BUTTON_CLASS}>
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
