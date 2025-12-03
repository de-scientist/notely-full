import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.ts';

const prisma = new PrismaClient();
const router = Router();

// POST /api/categories/regenerate
router.post('/regenerate', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const defaults = await prisma.category.findMany({
      where: { isDefault: true },
    });

    for (const def of defaults) {
      await prisma.category.upsert({
        where: {
          // Composite uniqueness: category name + user
          name_userId: {
            name: def.name,
            userId,
          },
        },
        update: {},
        create: {
          name: def.name,
          userId,
        },
      });
    }

    return res.json({ message: 'Categories regenerated.' });
  } catch (err) {
    next(err);
  }
});
