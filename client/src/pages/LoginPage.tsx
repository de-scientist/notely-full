import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
// 👇 NEW: Import toast from sonner
import { toast } from 'sonner'; 
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
// 👇 Updated Shadcn Imports
import { Button } from "../components/ui/button";
import { 
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
    CardDescription,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from '../components/ui/label';
import { Loader2, Lock, User } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      // Set loading state before API call
      setLoading(true);
      const res = await api.post('/auth/login', { identifier, password });
      return res.data.user;
    },
    onSuccess: (user) => {
      setUser(user);
      setLoading(false);
      
      // 👇 ADD SONNER TOAST HERE
      toast.success(`Welcome back, ${user.firstName}!`, {
        description: 'You have been successfully logged in.',
      });
      
      navigate('/app/notes');
    },
    onError: async (err: any) => {
      setLoading(false);
      const msg = err?.response?.data?.message ?? 'Login failed. Check your credentials.';
      setError(msg);
      
      // 👇 Optional: Add a toast for login error as well
      toast.error('Login Failed', {
        description: msg,
      });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!identifier || !password) {
        setError("Both identifier and password are required.");
        return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card className="shadow-2xl dark:bg-gray-800">
        
        {/* Card Header for Title and Description */}
        <CardHeader className="text-center space-y-2">
          <Lock className="h-8 w-8 text-primary mx-auto" />
          <CardTitle className="text-3xl font-bold dark:text-white">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground dark:text-gray-400">
            Sign in to continue using Notely.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Identifier Input */}
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="identifier"
                  placeholder="name@example.com or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
                <p className="text-sm font-medium text-red-500 text-center">{error}</p>
            )}
            
            {/* Submit Button */}
            <Button 
                type="submit" 
                disabled={mutation.isPending} 
                className="w-full text-lg font-semibold"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </Button>
          </form>
        </CardContent>
        
        {/* Card Footer for Register Link */}
        <CardFooter className="flex justify-center border-t pt-4 dark:border-gray-700">
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}