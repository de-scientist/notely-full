import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth";
import { toast } from "sonner";

export function AuthCallbackPage() {
    const navigate = useNavigate();
    const setUser = useAuthStore((s) => s.setUser);
    const setLoading = useAuthStore((s) => s.setLoading);

    useEffect(() => {
        const handleOAuth = async () => {
            setLoading(true);

            // Fetch the session returned from Supabase OAuth
            const { data, error } = await supabase.auth.getSession();

            if (error || !data.session) {
                setLoading(false);
                toast.error("Authentication Failed", {
                    description: error?.message || "No session found.",
                });
                navigate("/login");
                return;
            }

            // Get user details
            const { user } = data.session;

            if (!user) {
                setLoading(false);
                toast.error("Authentication Failed", {
                    description: "Could not retrieve user details.",
                });
                navigate("/login");
                return;
            }

            // Push user into your zustand local auth store
            setUser({
                id: user.id,
                email: user.email!,
                firstName: user.user_metadata?.full_name?.split(" ")[0] ?? "User",
                lastName: user.user_metadata?.full_name?.split(" ")[1] ?? "",
                avatar: user.user_metadata?.avatar_url || null,
                // Add any fields you store normally
            });

            setLoading(false);
            toast.success("Welcome!", { description: "You're now logged in." });

            navigate("/app/notes");
        };

        handleOAuth();
    }, [navigate, setUser, setLoading]);

    return (
        <div className="w-full h-screen flex items-center justify-center">
            <p className="text-lg text-muted-foreground animate-pulse">
                Completing sign-in…
            </p>
        </div>
    );
}
