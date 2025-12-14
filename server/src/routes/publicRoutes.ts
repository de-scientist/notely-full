import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { Request } from "express"; // Import Request for parameter typing

const prisma = new PrismaClient();
const router = Router();

// Include structure for entries
const entryInclude = {
  category: {
    select: { id: true, name: true },
  },
  // Only include basic user info for public display, not sensitive data
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatar: true,
    },
  },
};

// Interface for parameters (ID is in the URL for single entry fetch)
interface SingleEntryParams {
  id: string;
}

// ----------------------------------------------------------------------
// 1. GET /api/entries/public - explore public entries
// ----------------------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const entries = await prisma.entry.findMany({
      where: {
        isPublic: true,
        isDeleted: false,
      },
      include: entryInclude,
      orderBy: [
        { pinned: "desc" }, // Pinned entries first
        { createdAt: "desc" }, // Then newest first
      ],
    });

    res.json({ entries });
  } catch (err) {
    next(err);
  }
});

// ----------------------------------------------------------------------
// 2. ⭐ FIX: GET /api/entries/public/:id - Fetch a single public entry
// ----------------------------------------------------------------------
/** * This route is crucial for your frontend /share/:id page.
 * It uses the internal note ID passed from the URL.
 */
router.get("/:id", async (req: Request<SingleEntryParams>, res, next) => {
  try {
    const { id } = req.params;

    // Find the entry by ID, ensuring it is public and not deleted
    const entry = await prisma.entry.findFirst({
      where: {
        id,
        isPublic: true,
        isDeleted: false,
      },
      include: entryInclude,
    });

    if (!entry) {
      // Use 404 to avoid leaking information if the note exists but is private or deleted.
      return res
        .status(404)
        .json({ message: "Shared note not found or is private." });
    }

    // Success: return the public entry data
    return res.json({ entry });
  } catch (err) {
    // Handle potential Prisma or server errors
    console.error("Error fetching single public entry:", err);
    next(err);
  }
});

export default router;
