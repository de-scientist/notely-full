import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { signToken } from '../utils/jwt.ts';

const prisma = new PrismaClient();
const router = Router();
const TOKEN_COOKIE_NAME = 'token';

// ------------------- GOOGLE -------------------
router.get('/oauth/google', async (req, res) => {
  const redirect_uri = process.env.GOOGLE_REDIRECT_URI!;
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirect_uri}&response_type=code&scope=openid email profile`;
  res.redirect(url);
});

router.get('/oauth/google/callback', async (req, res) => {
  try {
    const { code } = req.query as { code: string };

    // Exchange code for access token
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });
    const { id_token } = tokenRes.data;

    // Decode token to get user info
    const userInfoRes = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`);
    const { email, name, sub, picture } = userInfoRes.data;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { 
          email,
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          provider: 'google',
          providerId: sub,
          emailVerified: true,
          avatar: picture,
        },
      });
    }

    const token = signToken({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.redirect(`${process.env.FRONTEND_URL}/app/notes`);
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

// ------------------- GITHUB -------------------
router.get('/oauth/github', async (req, res) => {
  const redirect_uri = process.env.GITHUB_REDIRECT_URI!;
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=user:email`;
  res.redirect(url);
});

router.get('/oauth/github/callback', async (req, res) => {
  try {
    const { code } = req.query as { code: string };

    // Exchange code for access token
    const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
      code,
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    }, { headers: { Accept: 'application/json' } });

    const { access_token } = tokenRes.data;

    // Get user info
    const userRes = await axios.get('https://api.github.com/user', { headers: { Authorization: `token ${access_token}` } });
    const emailsRes = await axios.get('https://api.github.com/user/emails', { headers: { Authorization: `token ${access_token}` } });

    const { id, login, avatar_url, name } = userRes.data;
    const primaryEmail = emailsRes.data.find((e: any) => e.primary)?.email;

    let user = await prisma.user.findUnique({ where: { email: primaryEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: primaryEmail,
          firstName: name?.split(' ')[0] || login,
          lastName: name?.split(' ').slice(1).join(' ') || '',
          provider: 'github',
          providerId: id.toString(),
          emailVerified: true,
          avatar: avatar_url,
        },
      });
    }

    const token = signToken({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.redirect(`${process.env.FRONTEND_URL}/app/notes`);
  } catch (err) {
    console.error(err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
});

export default router;
