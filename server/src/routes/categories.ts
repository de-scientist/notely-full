// src/routes/categories.ts
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth.ts";

const prisma = new PrismaClient();
const router = Router();

// Apply authentication middleware to all category routes
router.use(requireAuth);

// ----------------------------------------------------------------------
// GET /api/categories - get all categories for the authenticated user
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Fetch user categories (including default/global categories)
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId }, // user's own categories
          { isDefault: true }, // default/global categories
        ],
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        userId: true,
        isDefault: true,
        aiScore: true,
      },
    });

    return res.json({ categories });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// POST /api/categories/reset - regenerate default categories for user
router.post("/reset", async (req, res, next) => {
  try {
    const userId = req.user!.id;

    // Define default categories
    const defaultCategories = [
      { name: "Ideas", isDefault: true },
      { name: "Work", isDefault: true },
      { name: "Personal", isDefault: true },
      { name: "Projects", isDefault: true },
    ];

    // Remove user's non-default categories
    await prisma.category.deleteMany({
      where: { userId, isDefault: false },
    });

    // Upsert default categories for the user
    for (const cat of defaultCategories) {
      await prisma.category.upsert({
        where: { name_userId: { name: cat.name, userId } },
        update: {},
        create: { ...cat, userId },
      });
    }

    const updatedCategories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        userId: true,
        isDefault: true,
        aiScore: true,
      },
    });

    return res.json({
      message: "Categories reset successfully",
      categories: updatedCategories,
    });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
export default router;
