import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { signToken } from '../utils/jwt.ts';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const router = Router();
const TOKEN_COOKIE_NAME = 'token';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ------------------- GOOGLE -------------------
router.get('/google', async (req, res) => {
  const redirect_uri = process.env.GOOGLE_REDIRECT_URI!;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirect_uri}&response_type=code&scope=openid email profile`;
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query as { code: string };
    if (!code) throw new Error('No code returned from Google');

    // Exchange code for access token
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    const { id_token } = tokenRes.data;

    // Get user info
    const userInfoRes = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`);
    const { email, name, sub, picture } = userInfoRes.data;

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create new user if not found
      user = await prisma.user.create({
        data: {
          email,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          password: '', // OAuth users won't have a local password
          avatar: picture,
          emailVerified: true, // Mark verified by default
          provider: 'google',
          providerId: sub,
        },
      });
    }

    const token = signToken({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${FRONTEND_URL}/app/notes`);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// ------------------- GITHUB -------------------
router.get('/github', async (req, res) => {
  const redirect_uri = process.env.GITHUB_REDIRECT_URI!;
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=user:email`;
  res.redirect(url);
});

router.get('/github/callback', async (req, res) => {
  try {
    const { code } = req.query as { code: string };
    if (!code) throw new Error('No code returned from GitHub');

    // Exchange code for access token
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      },
      { headers: { Accept: 'application/json' } }
    );

    const { access_token } = tokenRes.data;
    if (!access_token) throw new Error('GitHub access token not received');

    // Get user info
    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` },
    });
    const emailsRes = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `token ${access_token}` },
    });

    const { id, login, avatar_url, name } = userRes.data;
    const primaryEmail = emailsRes.data.find((e: any) => e.primary)?.email;

    if (!primaryEmail) throw new Error('No primary email found for GitHub user');

    let user = await prisma.user.findUnique({ where: { email: primaryEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: primaryEmail,
          firstName: name?.split(' ')[0] || login,
          lastName: name?.split(' ').slice(1).join(' ') || '',
          password: '', // OAuth users won't have a local password
          avatar: avatar_url,
          emailVerified: true,
          provider: 'github',
          providerId: id.toString(),
        },
      });
    }

    const token = signToken({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${FRONTEND_URL}/app/notes`);
  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
  }
});

export default router;
