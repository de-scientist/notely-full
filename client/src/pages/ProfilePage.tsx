import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { 
    User, 
    Mail, 
    Lock, 
    LogOut, 
    Save, 
    KeyRound, 
    AlertTriangle, 
    CheckCircle,
    Loader2
} from 'lucide-react';

interface UserResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    avatar: string | null;
  };
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, clear } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { data, isLoading: isLoadingUserData } = useQuery<UserResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    },
  });

  useEffect(() => {
    const u = data?.user || user;
    if (u) {
      setFirstName(u.firstName);
      setLastName(u.lastName);
      setUsername(u.username);
      setEmail(u.email);
      setAvatar(u.avatar || '');
    }
  }, [data, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch('/user', {
        firstName,
        lastName,
        username,
        email,
        avatar: avatar || null,
      });
      return res.data.user as UserResponse['user'];
    },
    onSuccess: (updated) => {
      setUser(updated as any);
      setProfileError(null);
      setProfileMessage('Profile updated successfully.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Unable to update profile.';
      setProfileError(msg);
      setProfileMessage(null);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      setPasswordError(null);
      setPasswordMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Unable to update password.';
      setPasswordError(msg);
      setPasswordMessage(null);
    },
  });

  const onProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    updateProfileMutation.mutate();
  };

  const onPasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);
    updatePasswordMutation.mutate();
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clear();
      navigate('/');
    }
  };

  if (isLoadingUserData) {
    return (
        <div className="mt-16 flex justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-2">
            <User className="h-7 w-7 text-primary" /> Account Settings
        </h1>
        <div className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
            
            {/* --- Profile Update Card --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl dark:text-white">Update Profile</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Update your basic information and profile image.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* First Name */}
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First name</Label>
                                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                            </div>
                            {/* Last Name */}
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
                        
                        {/* Avatar URL */}
                        <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar URL</Label>
                            <Input
                                id="avatar"
                                value={avatar}
                                onChange={(e) => setAvatar(e.target.value)}
                                placeholder="https://your-image-url.com/avatar.jpg"
                            />
                            <p className="text-xs text-muted-foreground dark:text-gray-500">
                                Link to an image hosted externally (e.g., Cloudinary, S3).
                            </p>
                        </div>
                        
                        {/* Feedback Messages */}
                        {profileError && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{profileError}</AlertDescription>
                            </Alert>
                        )}
                        {profileMessage && (
                            <Alert className="border-green-500 text-green-700 bg-green-50/50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertTitle>Success</AlertTitle>
                                <AlertDescription>{profileMessage}</AlertDescription>
                            </Alert>
                        )}
                        
                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                            className="w-full sm:w-auto"
                        >
                            {updateProfileMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* --- Password and Logout Section --- */}
            <div className="space-y-6">
                
                {/* Change Password Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl dark:text-white flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-primary" /> Change Password
                        </CardTitle>
                        <CardDescription className="dark:text-gray-400">
                            Enter your current and new password to update your security credentials.
                        </CardDescription>
                        <Separator className="mt-4" />
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onPasswordSubmit} className="space-y-4">
                            {/* Current Password */}
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Current password</Label>
                                <Input
                                    id="currentPassword"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                            {/* Confirm New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                                <Input
                                    id="confirmNewPassword"
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                            
                            {/* Feedback Messages */}
                            {passwordError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{passwordError}</AlertDescription>
                                </Alert>
                            )}
                            {passwordMessage && (
                                <Alert className="border-green-500 text-green-700 bg-green-50/50">
                                    <AlertDescription>{passwordMessage}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={updatePasswordMutation.isPending}
                                className="w-full"
                            >
                                {updatePasswordMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Lock className="mr-2 h-4 w-4" />
                                )}
                                {updatePasswordMutation.isPending ? 'Updating...' : 'Update password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Logout Card */}
                <Card className="flex items-center justify-between p-6">
                    <div>
                        <CardTitle className="text-lg dark:text-white">Sign Out</CardTitle>
                        <CardDescription className="text-sm dark:text-gray-400">
                            Securely sign out of your Notely account across all devices.
                        </CardDescription>
                    </div>
                    <Button 
                        variant="destructive" 
                        onClick={handleLogout}
                        className="ml-4"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </Card>
            </div>
        </div>
    </div>
  );
}