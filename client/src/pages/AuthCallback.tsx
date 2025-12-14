import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth";
import { toast } from "sonner";
import { api } from "../lib/api";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    const handleOAuth = async () => {
      setLoading(true);

      // 1. Get Supabase session after OAuth redirect
      const { data: sessionData, error } = await supabase.auth.getSession();

      if (error || !sessionData.session) {
        setLoading(false);
        toast.error("Authentication Failed", {
          description: error?.message || "OAuth session missing.",
        });
        navigate("/login");
        return;
      }

      const { user, access_token } = sessionData.session;

      if (!user) {
        setLoading(false);
        toast.error("Authentication Failed", {
          description: "Could not retrieve user details.",
        });
        navigate("/login");
        return;
      }

      // 2. Extract metadata from Supabase
      const payload = {
        supabaseId: user.id,
        email: user.email,
        firstName: user.user_metadata?.full_name?.split(" ")[0] || "User",
        lastName: user.user_metadata?.full_name?.split(" ")[1] || "",
        avatar: user.user_metadata?.avatar_url || null,
        provider: user.app_metadata?.provider,
        supabaseAccessToken: access_token,
      };

      //             // 🔗 Sync email verification
      // if (user.email_confirmed_at) {
      //   await api.post("/auth/verify-email", {
      //     supabaseId: user.id,
      //   });
      // }

      try {
        // 3. Send to your backend to sync/create user & generate your JWT
        const res = await api.post("/auth/oauth", payload);

        const { user: backendUser, token } = res.data;

        // 4. Store your backend JWT
        setToken(token);
        localStorage.setItem("jwt", token);

        // 5. Store user using your existing auth pattern
        setUser(backendUser);

        toast.success("Welcome!", {
          description: "You're now logged in.",
        });

        setLoading(false);
        navigate("/app/notes");
      } catch (err: any) {
        console.error("OAuth backend sync error:", err);
        toast.error("Authentication Error", {
          description:
            err?.response?.data?.message || "Unable to sync with server.",
        });
        setLoading(false);
        navigate("/login");
      }
    };

    handleOAuth();
  }, [navigate, setUser, setToken, setLoading]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-lg text-muted-foreground animate-pulse">
        Connecting your account…
      </p>
    </div>
  );
}
