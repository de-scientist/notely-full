import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../../middleware/auth.ts';

const prisma = new PrismaClient();
const router = Router();

// POST /api/categories/reset
router.post('/reset', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  // Delete user's categories
  await prisma.category.deleteMany({
    where: { userId },
  });

  // Re-create from defaults
  const defaults = await prisma.category.findMany({
    where: { isDefault: true },
  });

  for (const def of defaults) {
    await prisma.category.create({
      data: {
        name: def.name,
        userId,
      },
    });
  }

  return res.json({ message: 'Categories reset for user.' });
});
