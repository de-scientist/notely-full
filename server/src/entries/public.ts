import { Router } from 'express';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();
const router = Router();

router.get('/public', async (req, res) => {
  const entries = await prisma.entry.findMany({
    where: {
      isPublic: true,
      isDeleted: false,
    },
    include: entryInclude,
    orderBy: { dateCreated: 'desc' },
  });

  res.json({ entries });
});
