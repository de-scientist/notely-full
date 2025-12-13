// server/src/routes/notes.ts
import { Router } from "express";
import { generateFullNote } from "../services/aiServices.ts";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// POST /api/notes/generate
// body: { title, synopsis, audience, tone, length, save: boolean, authorId?, categoryId? }
router.post("/generate", async (req, res) => {
  try {
    // Destructure required fields, including categoryId now
    const { title, synopsis, audience, tone, length, save, authorId, categoryId } = req.body;

    if (!title && !synopsis) {
      return res.status(400).json({ error: "Provide at least a title or a synopsis." });
    }

    const noteMarkdown = await generateFullNote({ title, synopsis, audience, tone, length });

    let saved = null;
    if (save) {
      // **NOTE:** You must ensure you have a default category ID or make categoryId required in the request body, 
      // as your Entry model requires it (categoryId String).
      
      const defaultCategoryId = categoryId || process.env.DEFAULT_CATEGORY_ID; // Placeholder for a real default ID

      if (!authorId || !defaultCategoryId) {
         return res.status(400).json({ 
           error: "Saving the entry requires an 'authorId' and a 'categoryId'." 
         });
      }

      // Prepare the data payload
      const entryData: any = {
        title: title ?? (synopsis?.slice(0, 60) ?? "Untitled"),
        synopsis: synopsis ?? "",
        content: noteMarkdown,
        
        // FIX 1: Map the categoryId foreign key directly
        categoryId: defaultCategoryId,
      };

      // FIX 2: Use the correct relation field name 'user' instead of 'author'
      // This connects the Entry to the existing User record.
      entryData.user = {
        connect: {
          id: authorId,
        },
      };

      saved = await prisma.entry.create({
        data: entryData, // Use the prepared data object
      });
    }

    return res.json({ note: noteMarkdown, saved });
  } catch (err: any) {
    console.error("Generate note error:", err);
    // Be careful not to expose internal Prisma error messages directly in production
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
});

export default router;