import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.ts";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

// PATCH /api/user - update primary info and avatar URL
router.patch("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, username, email, avatar } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (email && email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use." });
      }
    }

    if (username && username !== user.username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already in use." });
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName ?? user.firstName,
        lastName: lastName ?? user.lastName,
        username: username ?? user.username,
        email: email ?? user.email,
        avatar: avatar ?? user.avatar,
      },
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

    return res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
