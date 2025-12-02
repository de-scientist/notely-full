// 💜 Define OneNote-inspired color palette variables
// We'll use Tailwind's `fuchsia` or `purple` and adjust the shades for the primary color.
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ACCENT_BG_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600";

// 💡 GRADIENT CLASS: Updated to a professional purple/magenta gradient
const GRADIENT_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
// 👇 NEW: Import toast from sonner
import { toast } from 'sonner'; 
import { api } from '../lib/api';
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
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Loader2, UserPlus, AlertTriangle, CheckCircle } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/register', {
        firstName,
        lastName,
        username,
        email,
        password,
      });
      return res.data.user;
    },
    onSuccess: (user) => {
      setSuccess('Account created successfully. Redirecting to login...');
      setError(null);

      // 👇 ADD SONNER TOAST HERE
      toast.success(`Welcome, ${user.firstName}!`, {
        description: 'Your account has been created. Please log in.',
      });

      // Wait a moment for the success message/toast to show before redirecting
      setTimeout(() => navigate('/login'), 1500); 
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Unable to register.';
      setError(msg);
      setSuccess(null);
      
      // 👇 Optional: Add a toast for registration error
      toast.error('Registration Failed', {
        description: msg,
      });
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    mutation.mutate();
  };

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card className="shadow-2xl dark:bg-gray-800">
        
        {/* Card Header for Title and Description */}
        <CardHeader className="text-center space-y-2">
            {/* 👇 UPDATED: text-primary replaced with fuchsia shade */}
            <UserPlus className={`h-8 w-8 ${PRIMARY_COLOR_CLASS.replace('text', 'text')} mx-auto`} />
            <CardTitle className="text-3xl font-bold dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground dark:text-gray-400">
                Sign up to start capturing your notes.
            </CardDescription>
        </CardHeader>
        
        <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                </div>
                
                {/* Username */}
                <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                
                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                
                {/* Password */}
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                    />
                </div>
                
                {/* Feedback Messages */}
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert className="border-green-500 text-green-700 bg-green-50/50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}
                
                {/* Submit Button */}
                <Button 
                    type="submit" 
                    disabled={mutation.isPending} 
                    className={`w-full text-lg font-semibold ${GRADIENT_CLASS}`} 
                >
                    {mutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        'Sign up'
                    )}
                </Button>
            </form>
        </CardContent>
        
        {/* Card Footer for Login Link */}
        <CardFooter className="flex justify-center border-t pt-4 dark:border-gray-700">
            <p className="text-sm text-muted-foreground dark:text-gray-400">
                Already have an account?{' '}
                <Link 
                    to="/login" 
                    // 👇 UPDATED: text-primary replaced with fuchsia shade
                    className={`font-semibold ${PRIMARY_COLOR_CLASS.replace('text-fuchsia-700', 'text-fuchsia-700').replace('dark:text-fuchsia-500', 'dark:text-fuchsia-500')} hover:text-primary/80 transition-colors`}
                >
                    Log in
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}