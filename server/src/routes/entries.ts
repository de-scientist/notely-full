import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.ts';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express'; // 💡 Import Request, Response, NextFunction

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

// ----------------------------------------------------------------------
// 🎯 FIX: Define interfaces for Request Body data
// ----------------------------------------------------------------------

interface EntryCreationData {
    title: string;
    synopsis: string;
    content: string;
    categoryId: string;
    pinned?: boolean;
    isPublic?: boolean;
}

interface EntryUpdateData {
    title?: string;
    synopsis?: string;
    content?: string;
    categoryId?: string;
    pinned?: boolean;
    isPublic?: boolean;
    // Add other potential update fields here if necessary
}

// ----------------------------------------------------------------------
// End of new interfaces
// ----------------------------------------------------------------------

const entryInclude = {
  category: {
    select: { id: true, name: true },
  },
};

/** Helper — generate short public share IDs */
function generateShareId() {
  return crypto.randomBytes(8).toString('hex'); // 16-char slug
}

// ----------------------------------------------------------------------
// POST /api/entries - create a new entry (UPDATED FOR TYPE CASTING)
// Use the custom Request body type for better safety
router.post('/', async (req: Request<{}, {}, EntryCreationData>, res, next) => {
  try {
    const userId = req.user!.id;
    // 🎯 FIX APPLIED: TypeScript now recognizes the shape of req.body
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
        publicShareId: isPublic ? generateShareId() : null,
      },
      include: entryInclude,
    });

    return res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// GET /api/entries - unchanged
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const entries = await prisma.entry.findMany({
      where: { userId, isDeleted: false },
      orderBy: [
        { pinned: 'desc' },
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
// GET /api/entries/trash - unchanged
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
// GET /api/entry/:id - unchanged
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
// PATCH /api/entry/:id (UPDATED FOR TYPE CASTING)
// Use the custom Request body type for better safety
router.patch('/:id', async (req: Request<{ id: string }, {}, EntryUpdateData>, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    // 🎯 FIX APPLIED: TypeScript now recognizes the shape of req.body
    const { title, synopsis, content, categoryId, pinned, isPublic } = req.body; 

    const existing = await prisma.entry.findFirst({ where: { id, userId } });
    if (!existing || existing.isDeleted) return res.status(404).json({ message: 'Entry not found.' });

    // The type of updateData is inferred correctly by Prisma as Partial<Entry>
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (synopsis !== undefined) updateData.synopsis = synopsis;
    if (content !== undefined) updateData.content = content;

    // 🎯 FIX APPLIED: categoryId is now safely accessed
    if (categoryId !== undefined) {
      const valid = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!valid) return res.status(404).json({ message: 'Invalid categoryId provided.' });
      updateData.categoryId = categoryId;
    }

    // 🎯 FIX APPLIED: pinned is now safely accessed
    if (pinned !== undefined) updateData.pinned = pinned;

    // Handle public/private with share link regeneration
    // 🎯 FIX APPLIED: isPublic is now safely accessed
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;

      if (isPublic && !existing.publicShareId) {
        updateData.publicShareId = generateShareId();
      }

      // 🎯 FIX APPLIED: The explicit check is safe
      if (!isPublic) {
        updateData.publicShareId = null;
      }
    }

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
// RESTORE — unchanged
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
// SOFT DELETE — unchanged
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
// PERMANENT DELETE — unchanged
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

// ----------------------------------------------------------------------
// ⭐ NEW FEATURE: BOOKMARKS
// ----------------------------------------------------------------------

// Save Entry
router.post('/:id/bookmark', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id: entryId } = req.params;

    await prisma.bookmark.upsert({
      where: { userId_entryId: { userId, entryId } },
      update: {},
      create: { userId, entryId },
    });

    return res.json({ message: 'Entry bookmarked.' });
  } catch (err) {
    next(err);
  }
});

// Remove Entry
router.delete('/:id/bookmark', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id: entryId } = req.params;

    await prisma.bookmark.delete({
      where: { userId_entryId: { userId, entryId } },
    });

    return res.json({ message: 'Bookmark removed.' });
  } catch (err) {
    next(err);
  }
});

// List Bookmarked Entries
router.get('/bookmarks/all', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        entry: {
          include: entryInclude,
        },
      },
    });

    return res.json({ bookmarks });
  } catch (err) {
    next(err);
  }
});

export default router;