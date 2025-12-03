import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from './../middleware/auth.ts';

const prisma = new PrismaClient();
const router = Router();

router.get('/explore', async (req, res, next) => {
  try {
    const notes = await prisma.entry.findMany({
      where: { isPublic: true },
      orderBy: [
        { pinned: 'desc' },    // pinned notes first
        { createdAt: 'desc' }, // then newest
      ],
      include: { category: { select: { id: true, name: true } } },
    });

    res.json({ notes });
  } catch (err) {
    next(err);
  }
});
