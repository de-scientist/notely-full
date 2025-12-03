import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.ts';

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

// --- Helper for Prisma includes (to avoid repetition) ---
const entryInclude = {
  category: {
    select: { id: true, name: true },
  },
};

// ----------------------------------------------------------------------
// POST /api/entries - create a new entry
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { title, synopsis, content, categoryId, pinned, isPublic } = req.body;

    if (!title || !synopsis || !content || !categoryId) {
      return res.status(400).json({ message: 'Title, synopsis, content, and categoryId are required.' });
    }

    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) return res.status(404).json({ message: 'Invalid categoryId provided.' });

    const entry = await prisma.entry.create({
      data: {
        title,
        synopsis,
        content,
        userId,
        categoryId,
        pinned: pinned ?? false,
        isPublic: isPublic ?? false,
      },
      include: entryInclude,
    });

    return res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// GET /api/entries - get all non-deleted entries for user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const entries = await prisma.entry.findMany({
      where: { userId, isDeleted: false },
      orderBy: [
        { pinned: 'desc' }, // Pinned entries first
        { createdAt: 'desc' },
      ],
      include: entryInclude,
    });

    return res.json({ entries });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// GET /api/entries/trash
router.get('/trash', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const entries = await prisma.entry.findMany({
      where: { userId, isDeleted: true },
      orderBy: { createdAt: 'desc' },
      include: entryInclude,
    });

    return res.json({ entries });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// GET /api/entry/:id
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const entry = await prisma.entry.findFirst({
      where: { id, userId, isDeleted: false },
      include: entryInclude,
    });

    if (!entry) return res.status(404).json({ message: 'Entry not found.' });

    return res.json({ entry });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// PATCH /api/entry/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, synopsis, content, categoryId, pinned, isPublic } = req.body;

    const existing = await prisma.entry.findFirst({ where: { id, userId } });
    if (!existing || existing.isDeleted) return res.status(404).json({ message: 'Entry not found.' });

    const updateData: { [key: string]: any } = {};
    if (title !== undefined) updateData.title = title;
    if (synopsis !== undefined) updateData.synopsis = synopsis;
    if (content !== undefined) updateData.content = content;
    if (categoryId !== undefined) {
      const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) return res.status(404).json({ message: 'Invalid categoryId provided for update.' });
      updateData.categoryId = categoryId;
    }
    if (pinned !== undefined) updateData.pinned = pinned;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    if (Object.keys(updateData).length === 0) return res.status(200).json({ entry: existing });

    const entry = await prisma.entry.update({
      where: { id },
      data: updateData,
      include: entryInclude,
    });

    return res.json({ entry });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// PATCH /api/entry/restore/:id
router.patch('/restore/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.entry.findFirst({ where: { id, userId } });
    if (!existing || !existing.isDeleted) return res.status(404).json({ message: 'Entry not found in trash.' });

    const entry = await prisma.entry.update({
      where: { id },
      data: { isDeleted: false },
      include: entryInclude,
    });

    return res.json({ entry });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// DELETE /api/entry/:id - soft delete
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.entry.findFirst({ where: { id, userId } });
    if (!existing || existing.isDeleted) return res.status(404).json({ message: 'Entry not found.' });

    const entry = await prisma.entry.update({
      where: { id },
      data: { isDeleted: true },
      include: entryInclude,
    });

    return res.json({ entry });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// DELETE /api/entry/permanent/:id - permanent delete
router.delete('/permanent/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.entry.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Entry not found.' });

    await prisma.entry.delete({ where: { id } });

    return res.json({ message: 'Entry permanently deleted.' });
  } catch (err) {
    next(err);
  }
});

export default router;
