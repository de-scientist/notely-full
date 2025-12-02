import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX 1: Import useQuery from react-query
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'; 
import { api } from '../lib/api';
// Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, FilePlus2 } from 'lucide-react';

// 💜 OneNote-inspired color palette
const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const GRADIENT_BUTTON_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-md shadow-fuchsia-500/50 transition-all duration-300";


// ------------------------------------
// Mock Types & Query (Re-used from EditEntryPage)
// ------------------------------------
interface Category {
    id: string;
    name: string;
}

const useCategoriesQuery = () => useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: async () => {
        const res = await api.get('/categories');
        return res.data;
    },
});
// ------------------------------------


export function NewEntryPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState('');
    const [synopsis, setSynopsis] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState(''); // New state for categoryId
    const [error, setError] = useState<string | null>(null);
    
    // Fetch Categories Data
    const { data: categoriesData, isLoading: isLoadingCategories } = useCategoriesQuery();
    const categories = categoriesData?.categories ?? [];

    const mutation = useMutation({
        mutationFn: async () => {
            // 👇 categoryId included in post request
            const res = await api.post('/entries', { title, synopsis, content, categoryId });
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
        if (!categoryId) {
            setError('Please select a category.');
            return;
        }
        mutation.mutate();
    };
    
    // 👇 Updated loader color
    if (isLoadingCategories) return <div className="mt-16 flex justify-center"><Loader2 className={`animate-spin h-8 w-8 ${PRIMARY_TEXT_CLASS}`} /></div>;


    return (
        <div className="mx-auto max-w-3xl">
            <Card className="dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold dark:text-white">
                        {/* 👇 Updated icon color */}
                        <FilePlus2 className={`inline h-6 w-6 mr-2 ${PRIMARY_TEXT_CLASS}`} />
                        Create New Entry
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">Start capturing your new idea, plan, or thought.</CardDescription>
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
                                <Select value={categoryId} onValueChange={setCategoryId} required>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* FIX 2: Explicitly type 'cat' */}
                                        {categories.map((cat: Category) => ( 
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {categories.length === 0 && (
                                    <p className="text-xs text-orange-500 mt-1">No categories found. Please create one.</p>
                                )}
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
                        disabled={mutation.isPending || !categories.length} 
                        // 👇 Updated button styling
                        className={`w-full text-lg font-semibold ${GRADIENT_BUTTON_CLASS}`}
                    >
                        {mutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : 'Create Entry'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}