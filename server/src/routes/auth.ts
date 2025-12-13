// server/src/routes/auth.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { signToken } from "../utils/jwt.ts";
import bcrypt from "bcrypt";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth.ts";
import { supabaseAdmin } from "../lib/supabaseAdmin.ts";


const prisma = new PrismaClient();
const router = Router();
const TOKEN_COOKIE_NAME = "token";

// ---- Helpers
const SALT_ROUNDS = 10;

router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res.status(400).json({ message: "Email or username already in use." });
    }

    // 1️⃣ Create Supabase auth user (sends verification email)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (error || !data.user) {
      return res.status(400).json({ message: error?.message || "Auth creation failed" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 2️⃣ Create Prisma user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hash,
        provider: "email",
        emailVerified: false,
        supabaseId: data.user.id,
      },
    });

    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});


router.post("/login", async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username
    if (!identifier || !password) return res.status(400).json({ message: "Required" });

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });
    if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({ userId: user.id });
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

/**
 * OAuth backend-sync endpoint.
 * The frontend (AuthCallback page) should POST user info to this route after Supabase OAuth returns.
 * It will create or update a user, return your app JWT and the user object.
 *
 * Expected body:
 * {
 *   supabaseId, email, firstName, lastName, avatar, provider, providerId?
 * }
 */
router.post("/oauth", async (req, res) => {
  try {
    const { supabaseId, email, firstName, lastName, avatar, provider, providerId } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    // Try find by supabaseId first (preferred)
    let user = supabaseId
      ? await prisma.user.findUnique({ where: { supabaseId } }).catch(() => null)
      : null;

    if (!user) {
      // If not found by supabaseId, try by email
      user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
    }

    if (!user) {
      // Create new user
      const usernameBase = (email.split("@")[0] || `user${Date.now()}`).slice(0, 30);
      // Ensure username unique — naive attempt (you may want a more robust generator)
      let username = usernameBase;
      let counter = 0;
      while (await prisma.user.findUnique({ where: { username } })) {
        counter++;
        username = `${usernameBase}${counter}`;
        if (counter > 50) break;
      }

      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          username,
          avatar,
          provider: provider || "oauth",
          providerId: providerId?.toString() || undefined,
          supabaseId: supabaseId || undefined,
          emailVerified: true,
        },
      });
    } else {
      // update existing user with supabase id or provider info if missing
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: firstName ?? user.firstName,
          lastName: lastName ?? user.lastName,
          avatar: avatar ?? user.avatar,
          provider: user.provider ?? provider ?? "oauth",
          providerId: user.providerId ?? (providerId?.toString() || undefined),
          supabaseId: user.supabaseId ?? (supabaseId || undefined),
          emailVerified: true,
        },
      });
    }

    // create JWT and return
    const token = signToken({ userId: user.id });

    // optionally set cookie
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user, token });
  } catch (err) {
    console.error("OAuth sync error:", err);
    return res.status(500).json({ message: "OAuth sync failed" });
  }
});

// Example protected route using requireAuth (note: requireAuth uses prisma to verify user from token)
router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    // req.user was set in the middleware
    const user = req.user;
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  try {
    res.clearCookie(TOKEN_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.json({ message: "Logged out" });
  } catch (err) {
    return res.status(500).json({ message: "Logout failed" });
  }
});

export default router;
