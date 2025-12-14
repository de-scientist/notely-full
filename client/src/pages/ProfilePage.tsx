// 💜 Define OneNote-inspired color palette variables
const PRIMARY_COLOR_CLASS = "text-fuchsia-700 dark:text-fuchsia-500";
const ACCENT_BG_CLASS =
  "bg-fuchsia-600 hover:bg-fuchsia-700 dark:bg-fuchsia-700 dark:hover:bg-fuchsia-600";

// 💡 GRADIENT CLASS: Updated to a professional purple/magenta gradient
const GRADIENT_CLASS =
  "bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900 text-white shadow-lg shadow-fuchsia-500/50 transition-all duration-300 transform hover:scale-[1.03]";

import type { FormEvent } from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../store/auth";

import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import {
  User,
  Lock,
  LogOut,
  Save,
  KeyRound,
  AlertTriangle,
  CheckCircle,
  Loader2,
  UploadCloud,
  Camera,
} from "lucide-react";

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

// --- CLOUDINARY UPLOAD HANDLER ---
const VITE_CLOUDINARY_CLOUD_NAME =
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dwbqjzdvb";
const VITE_CLOUDINARY_UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "blogs_images";

const handleImageUpload = async (file: File): Promise<string> => {
  if (!VITE_CLOUDINARY_CLOUD_NAME || !VITE_CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary environment variables are not set.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", VITE_CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error.message || "Cloudinary upload failed.");
  }

  const data = await res.json();
  return data.secure_url; // Return the public URL
};

// --- AVATAR UPLOAD COMPONENT ---
interface AvatarUploadProps {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
}

function AvatarUpload({ avatarUrl, setAvatarUrl }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      const url = await handleImageUpload(file);
      setAvatarUrl(url);
      setUploadError(null);
    } catch (error: any) {
      setUploadError(error.message || "Image upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
      <Label
        htmlFor="avatar-upload"
        className="text-base font-semibold dark:text-white"
      >
        Profile Picture
      </Label>
      <div className="flex items-center space-x-4">
        {/* Avatar Preview */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <img
            src={
              avatarUrl ||
              "https://via.placeholder.com/150/f9a8d4/8b5cf6?text=U"
            }
            alt="User Avatar"
            className="w-full h-full rounded-full object-cover border-2 border-fuchsia-500 shadow-md"
          />
          {isUploading && (
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <input
            title="avatar"
            type="file"
            id="avatar-upload-file"
            ref={fileInputRef}
            accept="image/*"
            onChange={onFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full ${ACCENT_BG_CLASS} text-white`}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" /> Upload New Image
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground dark:text-gray-500">
            PNG, JPG, or GIF (max 5MB).
          </p>
        </div>
      </div>

      <Separator />

      {/* Manual URL Input */}
      <div className="space-y-2">
        <Label htmlFor="avatar-url-manual" className="text-sm">
          Or Enter Image URL Directly
        </Label>
        <div className="relative">
          <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="avatar-url-manual"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://your-image-url.com/avatar.jpg"
            className="pl-10"
          />
        </div>
      </div>

      {uploadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
// --- END AVATAR UPLOAD COMPONENT ---

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, clear } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(""); // State for avatar URL

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { data, isLoading: isLoadingUserData } = useQuery<UserResponse>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
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
      setAvatar(u.avatar || "");
    }
  }, [data, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch("/user", {
        firstName,
        lastName,
        username,
        email,
        avatar: avatar || null, // Use the updated avatar URL
      });
      return res.data.user as UserResponse["user"];
    },
    onSuccess: (updated) => {
      setUser(updated as any);
      setProfileError(null);
      setProfileMessage("Profile updated successfully.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Unable to update profile.";
      setProfileError(msg);
      setProfileMessage(null);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      setPasswordError(null);
      setPasswordMessage("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Unable to update password.";
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
      await api.post("/auth/logout");
    } finally {
      clear();
      navigate("/");
    }
  };

  if (isLoadingUserData) {
    return (
      <div className="mt-16 flex justify-center">
        <Loader2
          className={`animate-spin h-8 w-8 ${PRIMARY_COLOR_CLASS.replace("text", "text")}`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1
        className={`text-3xl font-bold dark:text-white flex items-center gap-2`}
      >
        <User
          className={`h-7 w-7 ${PRIMARY_COLOR_CLASS.replace("text", "text")}`}
        />{" "}
        Account Settings
      </h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* --- Profile Update Card --- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl dark:text-white">
              General Information
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Update your basic details, username, and email address.
            </CardDescription>
            <Separator className="mt-4" />
          </CardHeader>
          <CardContent>
            <form onSubmit={onProfileSubmit} className="space-y-6">
              {/* 🟢 NEW AVATAR UPLOAD SECTION */}
              <AvatarUpload avatarUrl={avatar} setAvatarUrl={setAvatar} />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
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
                className={`w-full sm:w-auto ${GRADIENT_CLASS}`}
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --- Password and Logout Section --- */}
        <div className="space-y-6">
          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`text-xl dark:text-white flex items-center gap-2`}
              >
                <KeyRound
                  className={`h-5 w-5 ${PRIMARY_COLOR_CLASS.replace("text", "text")}`}
                />{" "}
                Change Password
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Enter your current and new password to update your security
                credentials.
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
                  <Label htmlFor="confirmNewPassword">
                    Confirm new password
                  </Label>
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
                  className={`w-full ${GRADIENT_CLASS}`}
                >
                  {updatePasswordMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  {updatePasswordMutation.isPending
                    ? "Updating..."
                    : "Update password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Logout Card */}
          <Card className="flex items-center justify-between p-6">
            <div>
              <CardTitle className="text-lg dark:text-white">
                Sign Out
              </CardTitle>
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
