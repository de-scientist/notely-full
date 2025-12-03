import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "../components/ui/card";
import { Badge } from '../components/ui/badge';
import { Loader2, Tag, FilePenLine, Trash2, ArrowRight, PlusCircle, Star, StarOff, Search } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useState, useEffect } from 'react';

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

  const [entries, setEntries] = useState<Entry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('recent'); // 'recent' | 'pinned' | 'alphabetical'

  useEffect(() => {
    if (data?.entries) {
      setEntries(data.entries);
    }
  }, [data]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/entries/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      await api.patch(`/entries/${id}`, { pinned });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['entries'] }),
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const updated = Array.from(entries);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setEntries(updated);
  };

  const filteredEntries = entries
    .filter((entry) => 
      (entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.synopsis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.category.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory === 'All' || entry.category.name === selectedCategory)
    )
    .sort((a, b) => {
      if (sortOption === 'pinned') return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
      if (sortOption === 'alphabetical') return a.title.localeCompare(b.title);
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

  const categories = ['All', ...Array.from(new Set(entries.map(e => e.category.name)))];

  if (isLoading) return (
    <div className="mt-16 flex justify-center">
      <Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} />
    </div>
  );

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold dark:text-white">My Notes</h1>
        <Button
          className={`${CTA_BUTTON_CLASS} flex items-center gap-2`}
          onClick={() => navigate('/app/notes/new')}
        >
          <PlusCircle className="h-5 w-5" /> New Note
        </Button>
      </div>

      {/* Stats & Search */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex gap-4 items-center">
          <div className="bg-fuchsia-100 dark:bg-fuchsia-900/20 px-4 py-2 rounded-md shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Total Notes</p>
            <p className="text-xl font-semibold dark:text-white">{entries.length}</p>
          </div>
          <div className="bg-fuchsia-100 dark:bg-fuchsia-900/20 px-4 py-2 rounded-md shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Pinned Notes</p>
            <p className="text-xl font-semibold dark:text-white">{entries.filter(e => e.pinned).length}</p>
          </div>
          <div className="bg-fuchsia-100 dark:bg-fuchsia-900/20 px-4 py-2 rounded-md shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-300">Categories</p>
            <p className="text-xl font-semibold dark:text-white">{categories.length - 1}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"/>
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="recent">Recently Updated</option>
            <option value="pinned">Pinned First</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>
      </div>

      {/* Notes Grid with Quick Actions */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="notes-grid">
          {(provided) => (
            <div
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {filteredEntries.length ? filteredEntries.map((entry, index) => (
                <Draggable key={entry.id} draggableId={entry.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group flex flex-col justify-between shadow-md dark:bg-gray-800 transition-all 
                        ${snapshot.isDragging ? 'scale-[1.02] shadow-lg z-10' : 'hover:scale-[1.01]'}
                        ${entry.pinned ? 'border-2 border-fuchsia-500' : ''}
                      `}
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

                        {/* Quick Actions Hover Menu */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="p-1"
                            onClick={() => togglePinMutation.mutate({ id: entry.id, pinned: !entry.pinned })}
                          >
                            {entry.pinned ? <Star className="h-4 w-4 text-yellow-400" /> : <StarOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
                          </Button>
                          <Link to={`/app/notes/${entry.id}/edit`}>
                            <Button size="sm" variant="outline" className="p-1">
                              <FilePenLine className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="p-1"
                            onClick={() => deleteMutation.mutate(entry.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                        <Link to={`/app/notes/${entry.id}`}>
                          <Button size="sm" className={SOLID_BUTTON_CLASS}>
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  )}
                </Draggable>
              )) : (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">
                  No notes match your search or selected category.
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
