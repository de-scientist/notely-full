import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/auth.ts';

const router = Router();

router.use(requireAuth);

// --- Helper for Prisma includes (to avoid repetition) ---
const entryInclude = {
  category: {
    select: { id: true, name: true }, // Only return the category id and name
  },
};

// ----------------------------------------------------------------------

// POST /api/entries - create a new entry
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    // 👇 Destructure categoryId from the request body
    const { title, synopsis, content, categoryId } = req.body;

    if (!title || !synopsis || !content || !categoryId) {
      // 👇 categoryId is now required for creation
      return res.status(400).json({ message: 'Title, synopsis, content, and categoryId are required.' });
    }

    // Optional: Validate that the categoryId exists
    const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return res.status(404).json({ message: 'Invalid categoryId provided.' });
    }

    const entry = await prisma.entry.create({
      data: {
        title,
        synopsis,
        content,
        userId,
        // 👇 Add categoryId to the create data
        categoryId,
      },
      include: entryInclude, // 👇 Include category in the response
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
      orderBy: { dateCreated: 'desc' },
      include: entryInclude, // 👇 Include category in the response
    });

    return res.json({ entries });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------

// GET /api/entries/trash - get deleted entries
router.get('/trash', async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const entries = await prisma.entry.findMany({
      where: { userId, isDeleted: true },
      orderBy: { dateCreated: 'desc' },
      include: entryInclude, // 👇 Include category in the response
    });

    return res.json({ entries });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------

// GET /api/entry/:id - get a specific non-deleted entry
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const entry = await prisma.entry.findFirst({
      where: { id, userId, isDeleted: false },
      include: entryInclude, // 👇 Include category in the response
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found.' });
    }

    return res.json({ entry });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------

// PATCH /api/entry/:id - update entry
router.patch('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    // 👇 Destructure categoryId for potential update
    const { title, synopsis, content, categoryId } = req.body; 

    const existing = await prisma.entry.findFirst({ where: { id, userId } });
    if (!existing || existing.isDeleted) {
      return res.status(404).json({ message: 'Entry not found.' });
    }

    // Construct the data payload, using the existing value as a fallback
    const updateData: Record<string, any> = {
      title: title ?? existing.title,
      synopsis: synopsis ?? existing.synopsis,
      content: content ?? existing.content,
      // 👇 Update categoryId if provided
      categoryId: categoryId ?? existing.categoryId, 
    };
    
    // Optional: Validate that the new categoryId exists if one was provided
    if (categoryId) {
        const categoryExists = await prisma.category.findUnique({ where: { id: categoryId } });
        if (!categoryExists) {
          return res.status(404).json({ message: 'Invalid categoryId provided for update.' });
        }
    }


    const entry = await prisma.entry.update({
      where: { id },
      data: updateData,
      include: entryInclude, // 👇 Include category in the response
    });

    return res.json({ entry });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// PATCH /api/entry/restore/:id - restore deleted entry
// DELETE /api/entry/:id - soft delete
// These endpoints do not involve Category, so they remain unchanged.
// ----------------------------------------------------------------------

router.patch('/restore/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.entry.findFirst({ where: { id, userId } });
    if (!existing || !existing.isDeleted) {
      return res.status(404).json({ message: 'Entry not found in trash.' });
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: { isDeleted: false },
      include: entryInclude, // Included category for consistent response structure
    });

    return res.json({ entry });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const existing = await prisma.entry.findFirst({ where: { id, userId } });
    if (!existing || existing.isDeleted) {
      return res.status(404).json({ message: 'Entry not found.' });
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: { isDeleted: true },
      include: entryInclude, // Included category for consistent response structure
    });

    return res.json({ entry });
  } catch (err) {
    next(err);
  }
});

export default router;