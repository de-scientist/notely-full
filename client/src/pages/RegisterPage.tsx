// 💜 OneNote-inspired color palette
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ACCENT_BG_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600";

// 💡 Gradient Class for buttons
const GRADIENT_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '../lib/api';

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

import { 
    Loader2, 
    UserPlus, 
    AlertTriangle, 
    CheckCircle, 
    User, 
    Mail, 
    Lock, 
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
    const [confirmPassword, setConfirmPassword] = useState('');
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

            toast.success(`Welcome, ${user.firstName}!`, {
                description: 'Your account has been created. Please log in.',
            });

            setTimeout(() => navigate('/login'), 1500); 
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message ?? 'Unable to register.';
            setError(msg);
            setSuccess(null);
            toast.error('Registration Failed', { description: msg });
        },
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            toast.error('Validation Error', {
                description: 'The password and confirm password fields must match.',
            });
            return;
        }

        mutation.mutate();
    };

    const passwordsMismatch = password && confirmPassword && password !== confirmPassword;

    return (
        <div className="mx-auto mt-10 mb-10 max-w-sm px-4">
            <Card className="shadow-2xl dark:bg-gray-800 rounded-2xl">
                
                <CardHeader className="text-center space-y-3">
                    <UserPlus className={`h-10 w-10 ${PRIMARY_COLOR_CLASS} mx-auto`} />
                    <CardTitle className="text-3xl font-bold dark:text-white">Create Account</CardTitle>
                    <CardDescription className="text-muted-foreground dark:text-gray-400">
                        Sign up to start capturing your notes.
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-5">
                        
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {['First name', 'Last name'].map((label, idx) => (
                                <div key={idx} className="space-y-2">
                                    <Label className="flex items-center gap-2 hover:text-fuchsia-700 transition-colors cursor-text">
                                        <User className="h-4 w-4" />
                                        {label}
                                    </Label>
                                    <Input
                                        value={idx === 0 ? firstName : lastName}
                                        onChange={(e) => idx === 0 ? setFirstName(e.target.value) : setLastName(e.target.value)}
                                        required
                                        placeholder={`Enter your ${label.toLowerCase()}`}
                                        className="focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-600 dark:focus:ring-fuchsia-500/50 transition rounded-lg shadow-sm"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Username & Email */}
                        {[ 
                            { label: 'Username', value: username, setter: setUsername, icon: User, placeholder: 'Choose a unique username' },
                            { label: 'Email', value: email, setter: setEmail, icon: Mail, placeholder: 'you@example.com', type: 'email' }
                        ].map(({ label, value, setter, icon: Icon, placeholder, type }, idx) => (
                            <div key={idx} className="space-y-2">
                                <Label className="flex items-center gap-2 hover:text-fuchsia-700 transition-colors cursor-text">
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </Label>
                                <Input
                                    type={type || 'text'}
                                    value={value}
                                    onChange={(e) => setter(e.target.value)}
                                    required
                                    placeholder={placeholder}
                                    className="focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-600 dark:focus:ring-fuchsia-500/50 transition rounded-lg shadow-sm"
                                />
                            </div>
                        ))}

                       {/* Password Fields */}
{[
    { label: 'Password', value: password, setter: setPassword, show: showPassword, toggle: setShowPassword },
    { label: 'Confirm Password', value: confirmPassword, setter: setConfirmPassword, show: showConfirmPassword, toggle: setShowConfirmPassword }
].map(({ label, value, setter, show, toggle }, idx) => (
    <div key={idx} className="space-y-2">
        <Label className="flex items-center gap-2 hover:text-fuchsia-700 transition-colors cursor-text">
            <Lock className="h-4 w-4" />
            {label}
        </Label>
        <div className="relative">
            <Input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => setter(e.target.value)}
                required
                placeholder={`Enter your ${label.toLowerCase()}`}
                className="pr-10 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-600 dark:focus:ring-fuchsia-500/50 transition rounded-lg shadow-sm"
            />
            {/* 👁️ Only the eye icon, clickable */}
            <div
                onClick={() => toggle(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer hover:text-fuchsia-700 dark:hover:text-fuchsia-400 transition-transform active:scale-95"
                title={show ? 'Hide password' : 'Show password'}
            >
                {show ? <EyeOff className="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-400" /> 
                     : <Eye className="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-400" />}
            </div>
        </div>
        {passwordsMismatch && idx === 1 && (
            <p className="text-sm text-red-500 flex items-center gap-1 animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                Passwords do not match.
            </p>
        )}
    </div>
))}


                        {/* Alerts */}
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

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={!!(mutation.isPending || passwordsMismatch)}
                            className={`w-full text-lg font-semibold ${GRADIENT_CLASS} flex items-center justify-center gap-2 transition-transform active:scale-[0.97]`}
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" /> Sign up
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>

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
