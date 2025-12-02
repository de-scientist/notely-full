import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
// 👇 Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, NotebookText } from 'lucide-react';


// ------------------------------------
// Mock Types & Query (Replace with actual Category logic)
// ------------------------------------
interface Category {
  id: string;
  name: string;
}

interface Entry {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  categoryId: string; // Added categoryId
  category: Category; // Added category relation
}

// Mock query to fetch categories (You will need to implement this endpoint)
const useCategoriesQuery = () => useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
});
// ------------------------------------


export function EditEntryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState(''); // New state for categoryId
  const [error, setError] = useState<string | null>(null);

  // Fetch Entry Data
  const { data, isLoading } = useQuery<{ entry: Entry }>({
    queryKey: ['entry', id],
    queryFn: async () => {
      const res = await api.get(`/entries/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch Categories Data
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategoriesQuery();
  const categories = categoriesData?.categories ?? [];

  useEffect(() => {
    if (data?.entry) {
      setTitle(data.entry.title);
      setSynopsis(data.entry.synopsis);
      setContent(data.entry.content);
      // Initialize categoryId from fetched entry data
      setCategoryId(data.entry.category.id); 
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      // 👇 categoryId included in patch request
      const res = await api.patch(`/entries/${id}`, { title, synopsis, content, categoryId });
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
    if (!categoryId) {
        setError('Please select a category.');
        return;
    }
    mutation.mutate();
  };

  if (isLoading || isLoadingCategories || !id) return <div className="mt-16 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  if (!data?.entry) return <p className="mt-8 text-center text-sm text-muted-foreground">Entry not found or unauthorized.</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-white">
            <NotebookText className="inline h-6 w-6 mr-2 text-primary" />
            Edit: {data.entry.title}
          </CardTitle>
          <CardDescription className="dark:text-gray-400">Update the details and content for your note.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                
                {/* Category Selector */}
                <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoadingCategories}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Synopsis */}
            <div>
              <Label htmlFor="synopsis">Synopsis</Label>
              <Input id="synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} required />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Content (Supports Markdown)</Label>
              <Textarea
                id="content"
                rows={15}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
            
          </form>
        </CardContent>
        <CardFooter>
            <Button 
                type="submit" 
                onClick={onSubmit}
                disabled={mutation.isPending || isLoadingCategories} 
                className="w-full text-lg font-semibold"
            >
                {mutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : 'Save Changes'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}