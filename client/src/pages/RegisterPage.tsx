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

// 👇 Updated Shadcn Imports & NEW Icons
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
// 👇 NEW: Import icons for better UX
import { 
    Loader2, 
    UserPlus, 
    AlertTriangle, 
    CheckCircle, 
    User, // For Name inputs
    Mail, // For Email input
    Lock, // For Password inputs
    Eye, 
    EyeOff 
} from 'lucide-react';

export function RegisterPage() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // 👇 NEW: State for Confirm Password
    const [confirmPassword, setConfirmPassword] = useState(''); 
    
    // 👇 NEW: State for Password Visibility Toggle
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
    
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

        // 👇 NEW: Confirm Password Validation
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            toast.error('Validation Error', {
                description: 'The password and confirm password fields must match.',
            });
            return;
        }

        mutation.mutate();
    };

    return (
        <div className="mx-auto mt-10 mb-10 max-w-sm"> {/* Adjusted margin for better mobile view */}
            <Card className="shadow-2xl dark:bg-gray-800">
                
                {/* Card Header for Title and Description */}
                <CardHeader className="text-center space-y-2">
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
                                {/* 👇 UPDATED: Label with Icon */}
                                <Label htmlFor="firstName" className="flex items-center gap-2"><User className="h-4 w-4" />First name</Label>
                                <Input 
                                    id="firstName" 
                                    value={firstName} 
                                    onChange={(e) => setFirstName(e.target.value)} 
                                    required
                                    placeholder="Enter your first name" // 👇 ADDED Placeholder
                                />
                            </div>
                            <div className="space-y-2">
                                {/* 👇 UPDATED: Label with Icon */}
                                <Label htmlFor="lastName" className="flex items-center gap-2"><User className="h-4 w-4" />Last name</Label>
                                <Input 
                                    id="lastName" 
                                    value={lastName} 
                                    onChange={(e) => setLastName(e.target.value)} 
                                    required 
                                    placeholder="Enter your last name" // 👇 ADDED Placeholder
                                />
                            </div>
                        </div>
                        
                        {/* Username */}
                        <div className="space-y-2">
                            {/* 👇 UPDATED: Label with Icon */}
                            <Label htmlFor="username" className="flex items-center gap-2"><User className="h-4 w-4" />Username</Label>
                            <Input 
                                id="username" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required
                                placeholder="Choose a unique username" // 👇 ADDED Placeholder
                            />
                        </div>
                        
                        {/* Email */}
                        <div className="space-y-2">
                            {/* 👇 UPDATED: Label with Icon */}
                            <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" />Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="you@example.com" // 👇 ADDED Placeholder
                            />
                        </div>
                        
                        {/* Password Field */}
                        <div className="space-y-2">
                            {/* 👇 UPDATED: Label with Icon */}
                            <Label htmlFor="password" className="flex items-center gap-2"><Lock className="h-4 w-4" />Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    // 👇 UPDATED: Dynamically set type
                                    type={showPassword ? "text" : "password"} 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    placeholder="Enter your password" // 👇 ADDED Placeholder
                                    className="pr-10" // Make room for the eye icon
                                />
                                {/* 👇 NEW: Eye Icon for Password Visibility */}
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute right-0 top-0 h-full p-0 px-3 flex items-center justify-center hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        
                        {/* 👇 NEW: Confirm Password Field */}
                        <div className="space-y-2">
                            {/* 👇 UPDATED: Label with Icon */}
                            <Label htmlFor="confirmPassword" className="flex items-center gap-2"><Lock className="h-4 w-4" />Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    // 👇 UPDATED: Dynamically set type
                                    type={showConfirmPassword ? "text" : "password"} 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password" // 👇 ADDED Placeholder
                                    className="pr-10" // Make room for the eye icon
                                />
                                {/* 👇 NEW: Eye Icon for Confirm Password Visibility */}
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute right-0 top-0 h-full p-0 px-3 flex items-center justify-center hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {/* 👇 NEW: Live feedback for password mismatch */}
                            {password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword && (
                                <p className="text-sm text-red-500 flex items-center gap-1">
                                    <AlertTriangle className="h-4 w-4" />
                                    Passwords do not match.
                                </p>
                            )}
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
                            // 👇 UPDATED: Disable if passwords don't match (in addition to isPending)
                            disabled={mutation.isPending || (password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword)} 
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
                            className={`font-semibold ${PRIMARY_COLOR_CLASS} hover:text-fuchsia-700/80 dark:hover:text-fuchsia-500/80 transition-colors`}
                        >
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}