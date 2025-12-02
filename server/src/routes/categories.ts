// src/routes/categories.ts

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.ts'; // Assuming you have this middleware

const prisma = new PrismaClient();
const router = Router();

// Apply authentication middleware to all category routes
router.use(requireAuth);

// ----------------------------------------------------------------------

// GET /api/categories - get all categories for the user
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user!.id; // Get the authenticated user ID
        
        // Fetch all categories for the current user, ordered alphabetically
        const categories = await prisma.category.findMany({
            where: { userId },
            orderBy: { name: 'asc' },
        });

        // Respond with the list of categories
        return res.json({ categories });
    } catch (err) {
        next(err);
    }
});

// ----------------------------------------------------------------------

export default router;