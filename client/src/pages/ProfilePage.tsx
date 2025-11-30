import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Button, Card, Input } from '../components/ui';

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

  const { data } = useQuery<UserResponse>({
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

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1.5fr]">
      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          Update your basic information and avatar URL (from Cloudinary or similar).
        </p>
        <form onSubmit={onProfileSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">First name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Last name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Avatar URL</label>
            <Input
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Upload your image to Cloudinary (or similar) and paste the image URL here.
            </p>
          </div>
          {profileError && <p className="text-sm text-red-600">{profileError}</p>}
          {profileMessage && <p className="text-sm text-green-600">{profileMessage}</p>}
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full md:w-auto"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </Card>

      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
          <p className="mt-1 text-sm text-gray-600">Enter your current and new password.</p>
          <form onSubmit={onPasswordSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Current password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Confirm new password</label>
              <Input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-green-600">{passwordMessage}</p>}
            <Button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="w-full md:w-auto"
            >
              {updatePasswordMutation.isPending ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Logout</h2>
            <p className="mt-1 text-xs text-gray-600">Sign out of your Notely account.</p>
          </div>
          <Button className="bg-red-500 hover:bg-red-600" onClick={handleLogout}>
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}
