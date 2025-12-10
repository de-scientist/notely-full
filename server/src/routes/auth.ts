import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, isPasswordStrong } from '../utils/password.ts';
import { signToken } from '../utils/jwt.ts';
import { requireAuth } from '../middleware/auth.ts';
import { nanoid } from 'nanoid';
import { sendVerificationEmail } from '../utils/mailer.ts';

const prisma = new PrismaClient();
const router = Router();
const TOKEN_COOKIE_NAME = 'token';

// ------------------- REGISTER -------------------
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;

    if (!firstName || !lastName || !username || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    if (!isPasswordStrong(password))
      return res.status(400).json({ message: 'Password is too weak.' });

    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) return res.status(400).json({ message: 'Email already in use.' });

    const existingByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingByUsername) return res.status(400).json({ message: 'Username already in use.' });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { firstName, lastName, username, email, password: passwordHash, provider: 'email' },
    });

    const token = nanoid(32);
    await prisma.emailVerification.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 3600_000) },
    });

    await sendVerificationEmail(email, token); // send email link

    return res.status(201).json({ user, message: 'Check your email to verify account.' });
  } catch (err) {
    next(err);
  }
});

// ------------------- VERIFY EMAIL -------------------
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query as { token: string };
    const record = await prisma.emailVerification.findUnique({ where: { token } });

    if (!record || record.expiresAt < new Date())
      return res.status(400).json({ message: 'Invalid or expired token.' });

    await prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } });
    await prisma.emailVerification.delete({ where: { token } });

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) { res.status(500).json({ message: 'Server error.' }); }
});

// ------------------- LOGIN -------------------
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: 'Identifier and password are required.' });

    const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { username: identifier }] } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    if (user.provider === 'email' && !user.emailVerified)
      return res.status(400).json({ message: 'Please verify your email before logging in.' });

    // The login flow already ensures 'password' exists for 'email' provider
    // Social login users won't hit this path as they don't have a password set
    const valid = user.password ? await verifyPassword(password, user.password) : false; 
    if (!valid) return res.status(400).json({ message: 'Invalid credentials.' });

    const token = signToken({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, avatar: user.avatar } });
  } catch (err) { next(err); }
});

// ------------------- SOCIAL LOGIN -------------------
router.post('/oauth-login', async (req, res) => {
  try {
    const { email, firstName, lastName, provider, providerId } = req.body;

    if (!email || !provider || !providerId) return res.status(400).json({ message: 'Missing OAuth data.' });

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // FIX 1: Add a generated, unique 'username' to satisfy the UserCreateInput type.
      const generatedUsername = `${provider}_${providerId}_${nanoid(4)}`;

      user = await prisma.user.create({
        data: { 
          email, 
          firstName, 
          lastName, 
          provider, 
          providerId, 
          emailVerified: true, 
          username: generatedUsername // Required field
        },
      });
    }

    const token = signToken({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return res.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ message: 'OAuth login failed.' }); }
});

router.post('/logout', (req, res) => {
  res.clearCookie(TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return res.json({ message: 'Logged out' });
});

router.post('/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match.' });
    }

    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({ message: 'New password is too weak.' });
    }

    const userId = req.user!.id;

    // Must select 'password' field to verify current password
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { password: true, provider: true } // Only need password and provider here
    });
    
    // Check for user existence and ensure they used 'email' login (i.e., have a password)
    if (!user || user.provider !== 'email' || !user.password) {
      // Return a generic error for security, or a specific one if appropriate
      return res.status(400).json({ message: 'Cannot change password. Check user details or login method.' });
    }

    // FIX 2: Use non-null assertion on user.password because the check above guarantees it's not null.
    // Error: Argument of type 'string | null' is not assignable to parameter of type 'string'.
    const valid = await verifyPassword(currentPassword, user.password!); 
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const newHash = await hashPassword(newPassword);

    await prisma.user.update({ where: { id: userId }, data: { password: newHash } });

    return res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        avatar: true,
        dateJoined: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;