import { Router } from "express";
import { signToken } from "../utils/jwt.ts";
import { supabase } from "../lib/supabase.ts";
import dotenv from "dotenv";
dotenv.config();

const router = Router();
const TOKEN_COOKIE_NAME = "token";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ------------------- SOCIAL LOGIN REDIRECT -------------------
router.post("/oauth-login", async (req, res) => {
  try {
    const { provider } = req.body; // 'google' or 'github'
    if (!provider)
      return res.status(400).json({ message: "Provider is required" });

    // Supabase generates the OAuth redirect URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as "google" | "github",
      options: {
        redirectTo: `${FRONTEND_URL}/oauth-callback`,
      },
    });

    if (error) return res.status(400).json({ message: error.message });

    // data.url is the Supabase-hosted OAuth consent redirect
    return res.json({ url: data.url });
  } catch (err) {
    console.error("Supabase OAuth error:", err);
    return res.status(500).json({ message: "OAuth login failed" });
  }
});

// ------------------- CALLBACK HANDLED IN FRONTEND -------------------
// Supabase handles token exchange automatically when redirect comes back to your frontend
// Frontend should call /api/oauth/complete with session info if you want to set cookie

router.post("/oauth-complete", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token)
      return res.status(400).json({ message: "Access token missing" });

    // Get user info from Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(access_token);
    if (error || !user)
      return res.status(400).json({ message: "Invalid access token" });

    // Optionally issue your own JWT cookie
    const token = signToken({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OAuth complete failed" });
  }
});

export default router;
