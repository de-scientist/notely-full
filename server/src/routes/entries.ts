import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.ts';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();
const router = Router();

// ----------------------------------------------------------------------
// 🎯 FIX 1: PUBLIC ROUTE MUST BE DEFINED BEFORE requireAuth
// ----------------------------------------------------------------------

// Interface for parameters (ID is in the URL)
interface PublicEntryParams {
    id: string; 
}

/** * GET /api/entries/public/:id - Allows access to public notes without authentication.
 * We must use the 'public' prefix in the route to avoid conflict with the authenticated 
 * GET /api/entries/:id route defined later, and to place it correctly before the auth middleware.
 */
router.get('/public/:id', async (req: Request<PublicEntryParams>, res, next) => {
    try {
        const { id } = req.params;

        // 1. Find the entry by its internal ID and ensure it is public
        const entry = await prisma.entry.findUnique({
            where: { id, isPublic: true }, // enforce isPublic: true here for security
            include: {
                category: {
                    select: { id: true, name: true },
                },
            },
        });

        // 2. Check existence
        if (!entry) {
            // Respond with 404 (Not Found) to avoid leaking information about private note IDs
            return res.status(404).json({ message: 'Entry not found or is private.' });
        }

        // 3. Success: return the public entry data
        return res.json({ entry });

    } catch (err) {
        // Log error and pass to error handler
        console.error("Error fetching public entry:", err);
        // Using 500 for server error
        res.status(500).json({ message: 'An unexpected error occurred.' });
    }
});


// ----------------------------------------------------------------------
// APPLY AUTHENTICATION FOR ALL REMAINING ROUTES
// ----------------------------------------------------------------------
router.use(requireAuth); 


// ----------------------------------------------------------------------
// Define interfaces for Request Body data (Good practice - no change needed)
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
}

const entryInclude = {
    category: {
        select: { id: true, name: true },
    },
};

/** Helper — generate short public share IDs */
function generateShareId() {
    // 16-char slug
    return crypto.randomBytes(8).toString('hex'); 
}

// ----------------------------------------------------------------------
// POST /api/entries - create a new entry (Unchanged, already correct)
// ----------------------------------------------------------------------
router.post('/', async (req: Request<{}, {}, EntryCreationData>, res, next) => {
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
                // Only generate ID if isPublic is explicitly set to true
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
// GET /api/entries - list all entries
// ----------------------------------------------------------------------
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

        // 🎯 FIX 2: Removed unnecessary custom date mapping. Prisma/Express handles
        // date serialization (Date object -> ISO String) automatically when using res.json().
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
// GET /api/entry/:id - fetch single entry
// ----------------------------------------------------------------------
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;

        const entry = await prisma.entry.findFirst({
            where: { id, userId, isDeleted: false },
            include: entryInclude,
        });

        if (!entry) return res.status(404).json({ message: 'Entry not found.' });

        // 🎯 FIX 3: Removed unnecessary date formatting here as well.
        return res.json({ entry });
    } catch (err) {
        next(err);
    }
});

// ----------------------------------------------------------------------
// PATCH /api/entry/:id - update existing entry (Unchanged, already correct)
// ----------------------------------------------------------------------
router.patch('/:id', async (req: Request<{ id: string }, {}, EntryUpdateData>, res, next) => {
    try {
        const userId = req.user!.id;
        const { id } = req.params;
        const { title, synopsis, content, categoryId, pinned, isPublic } = req.body; 

        const existing = await prisma.entry.findFirst({ where: { id, userId } });
        if (!existing || existing.isDeleted) return res.status(404).json({ message: 'Entry not found.' });

        const updateData: any = {};

        if (title !== undefined) updateData.title = title;
        if (synopsis !== undefined) updateData.synopsis = synopsis;
        if (content !== undefined) updateData.content = content;

        if (categoryId !== undefined) {
            const valid = await prisma.category.findUnique({ where: { id: categoryId } });
            if (!valid) return res.status(404).json({ message: 'Invalid categoryId provided.' });
            updateData.categoryId = categoryId;
        }

        if (pinned !== undefined) updateData.pinned = pinned;

        // The logic for isPublic is already correct from previous fixes:
        if (isPublic !== undefined) {
            updateData.isPublic = isPublic;

            if (isPublic && !existing.publicShareId) {
                // Generate a share ID only if making public and one doesn't exist
                updateData.publicShareId = generateShareId();
            }

            if (!isPublic) {
                // Clear the share ID if making private
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
// NEW FEATURE: BOOKMARKS (Only minor fix on DELETE status code)
// ----------------------------------------------------------------------

// Save Entry (Unchanged)
router.post('/:id/bookmark', async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { id: entryId } = req.params;

        await prisma.bookmark.upsert({
            where: { userId_entryId: { userId, entryId } },
            update: {},
            create: { userId, entryId },
        });

        // 201 Created or 200 OK
        return res.status(201).json({ message: 'Entry bookmarked.' });
    } catch (err) {
        next(err);
    }
});

// Remove Entry
router.delete('/:id/bookmark', async (req, res, next) => {
    try {
        const userId = req.user!.id;
        const { id: entryId } = req.params;

        // Find the bookmark first to ensure existence before deleting
        const bookmark = await prisma.bookmark.findUnique({
            where: { userId_entryId: { userId, entryId } },
        });

        if (bookmark) {
            await prisma.bookmark.delete({
                where: { userId_entryId: { userId, entryId } },
            });
        }
        
        // 🎯 FIX 4: Use 204 No Content for a successful DELETE operation
        return res.status(204).end(); 
    } catch (err) {
        next(err);
    }
});

// List Bookmarked Entries (Unchanged)
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

        // Map to return only the entry data, or structure as needed
        const entries = bookmarks
            .filter(b => b.entry && !b.entry.isDeleted) // Only include entries that exist and are not soft-deleted
            .map(b => ({ ...b.entry, bookmarked: true }));

        return res.json({ entries });
    } catch (err) {
        next(err);
    }
});

export default router;