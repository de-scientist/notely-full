// 💜 OneNote-inspired color palette
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ACCENT_BG_CLASS = "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600";

// 💡 Gradient Class for buttons
const GRADIENT_CLASS = "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";

import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
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

    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [emailValid, setEmailValid] = useState<boolean | null>(null);
    const [passwordStrength, setPasswordStrength] = useState(0);
    
    // Track focused input for tooltip display
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const passwordsMismatch = password && confirmPassword && password !== confirmPassword;

    // 🔹 Password strength calculation
    useEffect(() => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[\W]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    }, [password]);

    // 🔹 Username live validation
    useEffect(() => {
        if (!username) return setUsernameAvailable(null);
        const timeout = setTimeout(async () => {
            try {
                const res = await api.get(`/auth/check-username?username=${username}`);
                setUsernameAvailable(res.data.available);
            } catch {
                setUsernameAvailable(false);
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [username]);

    // 🔹 Email format live validation
    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return setEmailValid(null);
        setEmailValid(emailRegex.test(email));
    }, [email]);

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
        if (!usernameAvailable) {
            setError('Username is not available.');
            return;
        }
        if (!emailValid) {
            setError('Email is invalid.');
            return;
        }

        mutation.mutate();
    };

    // Password strength color
    const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-green-500'];

    // Tooltip messages
    const tooltips: Record<string, string> = {
        firstName: 'Enter your first name as you want it displayed.',
        lastName: 'Enter your last name.',
        username: 'Choose a unique username, 3-15 characters.',
        email: 'Enter a valid email address.',
        password: 'Password must be 8+ chars, include uppercase, number & symbol.',
        confirmPassword: 'Re-enter your password to confirm it.',
    };

    return (
        <div className="mx-auto mt-10 mb-10 max-w-md">
            <Card className="shadow-2xl dark:bg-gray-800 rounded-xl overflow-hidden">
                
                <CardHeader className="text-center space-y-3 bg-fuchsia-50 dark:bg-gray-900 p-5">
                    <UserPlus className={`h-10 w-10 ${PRIMARY_COLOR_CLASS} mx-auto`} />
                    <CardTitle className="text-3xl font-bold dark:text-white">Create Account</CardTitle>
                    <CardDescription className="text-gray-700 dark:text-gray-400 transition-colors">
                        Sign up to start capturing your notes.
                    </CardDescription>
                </CardHeader>
                
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-6">
                        
                        {/* Inputs with tooltips */}
                        {[
                            { label: 'First name', value: firstName, setter: setFirstName, field: 'firstName' },
                            { label: 'Last name', value: lastName, setter: setLastName, field: 'lastName' },
                            { label: 'Username', value: username, setter: setUsername, field: 'username' },
                            { label: 'Email', value: email, setter: setEmail, field: 'email', type: 'email' },
                            { label: 'Password', value: password, setter: setPassword, field: 'password', type: 'password', show: showPassword, toggle: setShowPassword },
                            { label: 'Confirm Password', value: confirmPassword, setter: setConfirmPassword, field: 'confirmPassword', type: 'password', show: showConfirmPassword, toggle: setShowConfirmPassword }
                        ].map(({ label, value, setter, field, type, show, toggle }, idx) => (
                            <div key={idx} className="relative">
                                <Input
                                    type={type === 'password' && show !== undefined ? (show ? 'text' : 'password') : type || 'text'}
                                    value={value}
                                    onChange={(e) => setter(e.target.value)}
                                    required
                                    placeholder=" "
                                    className={`peer rounded-lg shadow-sm pr-${show ? '10' : '3'} focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-600 dark:focus:ring-fuchsia-500/50 transition
                                        ${field === 'username' && usernameAvailable === false ? 'border-red-500' : ''}
                                        ${field === 'email' && emailValid === false ? 'border-red-500' : ''}`}
                                    onFocus={() => setFocusedField(field)}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <Label className="absolute left-3 -top-2.5 text-gray-400 text-sm transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-500 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-fuchsia-700 dark:peer-focus:text-fuchsia-500">
                                    {label}
                                </Label>

                                {/* Eye toggle */}
                                {type === 'password' && show !== undefined && (
                                    <div
                                        onClick={() => toggle(!show)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer hover:text-fuchsia-700 dark:hover:text-fuchsia-400 transition-transform active:scale-95"
                                        title={show ? 'Hide password' : 'Show password'}
                                    >
                                        {show ? <EyeOff className="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-400" /> : <Eye className="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-400" />}
                                    </div>
                                )}

                                {/* Tooltips */}
                                {focusedField === field && (
                                    <div className="absolute left-0 top-full mt-1 w-full bg-fuchsia-50 dark:bg-gray-700 border border-fuchsia-200 dark:border-gray-600 rounded-md p-2 text-xs text-gray-800 dark:text-gray-200 shadow-lg animate-slide-in">
                                        {tooltips[field]}
                                    </div>
                                )}

                                {/* Additional feedback */}
                                {field === 'username' && username && usernameAvailable !== null && (
                                    <p className={`text-sm mt-1 ${usernameAvailable ? 'text-green-500' : 'text-red-500'}`}>
                                        {usernameAvailable ? 'Username available ✅' : 'Username taken ❌'}
                                    </p>
                                )}
                                {field === 'email' && email && emailValid !== null && (
                                    <p className={`text-sm mt-1 ${emailValid ? 'text-green-500' : 'text-red-500'}`}>
                                        {emailValid ? 'Valid email ✅' : 'Invalid email ❌'}
                                    </p>
                                )}
                                {field === 'password' && value && (
                                    <div className="h-1 w-full bg-gray-300 dark:bg-gray-700 rounded mt-1">
                                        <div className={`h-1 rounded ${strengthColor[passwordStrength-1] || 'bg-red-400'} transition-all`} style={{ width: `${(passwordStrength/4)*100}%` }} />
                                    </div>
                                )}
                                {field === 'confirmPassword' && passwordsMismatch && (
                                    <p className="text-sm text-red-500 flex items-center gap-1 animate-pulse mt-1">
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
                            disabled={mutation.isPending || passwordsMismatch || !usernameAvailable || !emailValid}
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
