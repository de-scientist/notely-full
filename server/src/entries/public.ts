import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Include structure for entries
const entryInclude = {
  category: {
    select: { id: true, name: true },
  },
  user: {
    select: { id: true, firstName: true, lastName: true, username: true, avatar: true },
  },
};

// GET /api/entries/public - explore public entries
router.get('/public', async (req, res, next) => {
  try {
    const entries = await prisma.entry.findMany({
      where: {
        isPublic: true,
        isDeleted: false,
      },
      include: entryInclude,
      orderBy: [
        { pinned: 'desc' },       // Pinned entries first
        { createdAt: 'desc' },    // Then newest first
      ],
    });

    res.json({ entries });
  } catch (err) {
    next(err);
  }
});

export default router;
