import { Router } from 'express';
import { supabase } from '../lib/supabaseClient';
import { signToken } from '../utils/jwt.ts';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();
const TOKEN_COOKIE_NAME = 'token';

// ------------------- REGISTER -------------------
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // Supabase handles hashing and email verification automatically
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ message: error.message });

    return res.status(201).json({ user: data.user, message: 'Check your email to verify account.' });
  } catch (err) {
    next(err);
  }
});

// ------------------- LOGIN -------------------
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ message: error.message });

    const token = signToken({ userId: data.user!.id });
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: data.user });
  } catch (err) {
    next(err);
  }
});

// ------------------- SOCIAL LOGIN -------------------
router.post('/oauth-login', async (req, res) => {
  try {
    const { provider } = req.body;
    if (!provider) return res.status(400).json({ message: 'Provider required' });

    // Supabase handles the OAuth redirect flow and token exchange
    const { data, error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) return res.status(400).json({ message: error.message });

    // Optionally set your JWT cookie for your app
    const token = signToken({ userId: data.user!.id });
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user: data.user });
  } catch (err) {
    res.status(500).json({ message: 'OAuth login failed' });
  }
});

// ------------------- PASSWORD RESET -------------------
router.post('/password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${process.env.FRONTEND_URL}/reset-password` });
    if (error) return res.status(400).json({ message: error.message });

    return res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed' });
  }
});

// ------------------- LOGOUT -------------------
router.post('/logout', requireAuth, async (req, res) => {
  try {
    await supabase.auth.signOut(); // clears Supabase session server-side
    res.clearCookie(TOKEN_COOKIE_NAME, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    return res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

// ------------------- GET CURRENT USER -------------------
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = supabase.auth.getUser(); // fetch current user
    return res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user' });
  }
});

export default router;
