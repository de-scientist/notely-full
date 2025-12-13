import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

import { supabase } from "../lib/supabase";

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
import { Loader2, Lock, User, Eye, EyeOff, Mail } from 'lucide-react';

const PRIMARY_TEXT_CLASS = "text-fuchsia-600 dark:text-fuchsia-500";
const GRADIENT_BUTTON_CLASS =
    "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-md shadow-fuchsia-500/50 transition-all duration-300";

// ---------------------
// Google / GitHub Login
// ---------------------
async function loginWithProvider(provider: "google" | "github") {
    const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) {
        toast.error("Social login failed", { description: error.message });
    }
}

// --- UI Components ---
const OrSeparator = () => (
    <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300 dark:border-gray-600"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground dark:text-gray-400">
                Or continue with
            </span>
        </div>
    </div>
);

const SocialLoginButtons = () => (
    <div className="flex flex-col gap-3">
        <Button
            onClick={() => loginWithProvider("google")}
            className="w-full flex justify-center items-center gap-3 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-400/50 transition-colors"
        >
            <img src="/google-icon.svg" alt="Google" className="h-5 w-5" />
            Sign in with Google
        </Button>

        <Button
            onClick={() => loginWithProvider("github")}
            className="w-full flex justify-center items-center gap-3 bg-gray-700 hover:bg-gray-600 text-white shadow-md shadow-gray-500/50 transition-colors"
        >
            <img src="/github-icon.svg" alt="GitHub" className="h-5 w-5" />
            Sign in with GitHub
        </Button>
    </div>
);

export function LoginPage() {
    const navigate = useNavigate();
    const setUser = useAuthStore((s) => s.setUser);
    const setLoading = useAuthStore((s) => s.setLoading);

    const savedIdentifier = localStorage.getItem('loginIdentifier') ?? '';
    const savedPassword = localStorage.getItem('loginPassword') ?? '';

    const [identifier, setIdentifier] = useState(savedIdentifier);
    const [password, setPassword] = useState(savedPassword);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resending, setResending] = useState(false);

    useEffect(() => { localStorage.setItem('loginIdentifier', identifier); }, [identifier]);
    useEffect(() => { localStorage.setItem('loginPassword', password); }, [password]);

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    const mutation = useMutation({
        mutationFn: async () => {
            setLoading(true);
            const res = await api.post('/auth/login', { identifier, password });
            return res.data.user;
        },
        onSuccess: (user) => {
            setUser(user);
            setLoading(false);
            toast.success(`Welcome back, ${user.firstName}!`);
            navigate('/app/notes');
        },
        onError: (err: any) => {
            setLoading(false);
            const msg = err?.response?.data?.message ?? 'Login failed. Check your credentials.';
            setError(msg);
            toast.error('Login Failed', { description: msg });
        },
    });

    const handleResendVerification = async () => {
        if (!isEmail) {
            toast.error("Enter your email address to resend verification.");
            return;
        }

        try {
            setResending(true);
            const { error } = await supabase.auth.resend({
                type: "signup",
                email: identifier,
            });

            if (error) {
                toast.error("Failed to resend verification", { description: error.message });
                return;
            }

            toast.success("Verification email sent", {
                description: "Check your inbox and confirm your email.",
            });
        } finally {
            setResending(false);
        }
    };

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
                <CardHeader className="text-center space-y-2">
                    <Lock className={`h-8 w-8 ${PRIMARY_TEXT_CLASS} mx-auto`} />
                    <CardTitle className="text-3xl font-bold dark:text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-muted-foreground dark:text-gray-400">
                        Sign in to continue using Notely.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <SocialLoginButtons />
                    <OrSeparator />

                    <form onSubmit={onSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Email or Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                    autoComplete="username"
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="space-y-2 text-center">
                                <p className="text-sm font-medium text-red-500">{error}</p>

                                {isEmail && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleResendVerification}
                                        disabled={resending}
                                        className="w-full flex gap-2 justify-center"
                                    >
                                        {resending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Mail className="h-4 w-4" />
                                        )}
                                        Resend verification email
                                    </Button>
                                )}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className={`w-full text-lg font-semibold ${GRADIENT_BUTTON_CLASS}`}
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : 'Log in'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t pt-4 dark:border-gray-700">
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className={`font-semibold ${PRIMARY_TEXT_CLASS}`}>
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
