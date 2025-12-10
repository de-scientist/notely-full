// server/src/routes/notes.ts
import { Router } from "express";
import { generateFullNote } from "../services/aiServices.ts";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// POST /api/notes/generate
// body: { title, synopsis, audience, tone, length, save: boolean, authorId? }
router.post("/generate", async (req, res) => {
  try {
    const { title, synopsis, audience, tone, length, save, authorId } = req.body;

    if (!title && !synopsis) {
      return res.status(400).json({ error: "Provide at least a title or a synopsis." });
    }

    const noteMarkdown = await generateFullNote({ title, synopsis, audience, tone, length });

    let saved = null;
    if (save) {
      // Prepare the data payload
      const entryData: any = {
        title: title ?? (synopsis?.slice(0, 60) ?? "Untitled"),
        synopsis: synopsis ?? "",
        content: noteMarkdown,
      };

      // FIX: Apply the authorId using the relation syntax (author: { connect: { id: authorId } })
      // This is the standard way to connect a record when using the non-unchecked input types.
      // Assuming 'authorId' is a string/ID that exists, and the relation field is named 'author'.
      if (authorId) {
        entryData.author = {
          connect: {
            id: authorId,
          },
        };
      }

      saved = await prisma.entry.create({
        data: entryData, // Use the prepared, flexible data object
      });
    }

    return res.json({ note: noteMarkdown, saved });
  } catch (err: any) {
    console.error("Generate note error:", err);
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
});

export default router;