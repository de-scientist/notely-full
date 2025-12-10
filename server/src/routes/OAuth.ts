// /c:/Users/TECH VISIONS/Desktop/T2G/notely-full/server/src/routes/OAuth.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { signToken } from '../utils/jwt.ts';
import dotenv from 'dotenv';
// FIX 1: Import nanoid from 'nanoid'
import { nanoid } from 'nanoid'; 
// FIX 4 & 5: Assuming you have a utility function named 'sendEmail' in your utils folder.
// If you intended to use 'sendVerificationEmail' as in the 'auth.ts' file, change this import.
// For now, I'll assume it's just 'sendEmail'.
import { sendVerificationEmail } from '../utils/mailer.ts'; 

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
      // FIX 1 (nanoid): The import fixes the nanoid usage here.
      user = await prisma.user.create({
        data: {
          email,
          firstName: name?.split(' ')[0] || 'User',
          lastName: name?.split(' ').slice(1).join(' ') || '',
          username: email.split('@')[0] + '_' + nanoid(5),
          provider: 'google',
          providerId: sub,
          emailVerified: true,
          avatar: picture,
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
      // FIX 2 (nanoid): The import fixes the nanoid usage here.
      user = await prisma.user.create({
        data: {
          email: primaryEmail,
          firstName: name?.split(' ')[0] || login,
          lastName: name?.split(' ').slice(1).join(' ') || '',
          username: login + '_' + nanoid(5),
          provider: 'github',
          providerId: id.toString(),
          emailVerified: true,
          avatar: avatar_url,
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

// ------------------- EMAIL VERIFICATION -------------------
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // FIX 3 (nanoid): The import fixes the nanoid usage here.
    const token = nanoid(32); 
    
    // FIX 4 (Prisma Schema): 'expiresAt' is required. Set it to 1 hour from now.
    // Error: Property 'expiresAt' is missing
    const expiresAt = new Date(Date.now() + 3600_000); // 1 hour expiration

    await prisma.emailVerification.create({
      data: { 
        userId: user.id, 
        token,
        expiresAt // Added the required field
      },
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    // FIX 5 (sendEmail): The import fixes the 'Cannot find name 'sendEmail' error.
    await sendVerificationEmail(email, `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`); 

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
});

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query as { token: string };
    const record = await prisma.emailVerification.findUnique({ where: { token } });
    
    // It's good practice to check for expiration here as well
    if (!record || record.expiresAt < new Date()) {
       return res.status(400).send('Invalid or expired token');
    }

    await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
    await prisma.emailVerification.delete({ where: { token } });

    res.redirect(`${process.env.FRONTEND_URL}/login?verified=true`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Verification failed');
  }
});

export default router;