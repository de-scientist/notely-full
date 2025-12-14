// /server/src/routes/notes.ts
import { Router, Request, Response } from "express";
import {
  generateFullNote,
  GenerateNoteOptions,
} from "../services/aiServices.ts"; // Import GenerateNoteOptions
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// POST /api/notes/generate
// body: { title, synopsis, audience, tone, length, save: boolean, authorId?, categoryId? }
router.post("/generate", async (req: Request, res: Response) => {
  // 1. Destructure and validate required fields
  const {
    title,
    synopsis,
    audience,
    tone,
    length,
    save,
    authorId,
    categoryId,
  } = req.body as {
    title?: string;
    synopsis?: string;
    audience?: string;
    tone?: string;
    length?: "short" | "medium" | "long";
    save?: boolean;
    authorId?: string;
    categoryId?: string;
  };

  // Server-side validation
  if (!authorId) {
    return res.status(401).json({ error: "User authentication required." });
  }

  const defaultCategoryId: string | undefined =
    categoryId || process.env.DEFAULT_CATEGORY_ID;

  if (save && !defaultCategoryId) {
    return res.status(400).json({
      error: "Saving the entry requires a 'categoryId'.",
    });
  }

  try {
    // 2. Build the options object, filtering out undefined values to satisfy exactOptionalPropertyTypes: true
    // FIX: Conditional object creation using spread and type narrowing (Resolves Error 2379)
    const options: GenerateNoteOptions = {
      ...(title && { title }),
      ...(synopsis && { synopsis }),
      ...(audience && { audience }),
      ...(tone && { tone }),
      ...(length && { length }),
    };

    const generatedNote: string = await generateFullNote(options);

    let savedEntry = null;

    // 4. Save to database if requested
    if (save && defaultCategoryId) {
      const finalCategoryId = defaultCategoryId as string;
      const finalAuthorId = authorId as string;

      // Calculate fallback title and ensure it's treated as a string immediately
      const fallbackTitle = generatedNote
        .split("\n")[0]
        .replace(/^[#>\-\*]+\s*/, "")
        .trim()
        .substring(0, 100) as string;

      // Ensure title/synopsis are safe to use by coalescing to an empty string for the fallback logic
      const safeTitle = title ?? "";
      const safeSynopsis = synopsis ?? "";

      savedEntry = await prisma.entry.create({
        data: {
          // Core Data
          // FIX: Using the safe, coalesced variables (Resolves Error 2532)
          title: safeTitle || fallbackTitle,
          synopsis: safeSynopsis || safeTitle || fallbackTitle,
          content: generatedNote,

          // Relation Fields (Unchecked Create Input pattern)
          categoryId: finalCategoryId,
          userId: finalAuthorId,
        },
        select: { id: true },
      });
    }

    // 5. Send back the generated note and saved status
    return res.json({
      note: generatedNote,
      saved: savedEntry,
    });
  } catch (error) {
    console.error("AI Note generation or save error:", error);

    if ((error as any).code === "P2025" || (error as any).code === "P2003") {
      return res
        .status(400)
        .json({ error: "The specified User or Category ID does not exist." });
    }
    return res
      .status(500)
      .json({
        error: "Failed to generate or save note due to a server error.",
      });
  }
});

export default router;
