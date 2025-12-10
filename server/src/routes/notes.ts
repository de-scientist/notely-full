// server/src/routes/notes.ts
import { Router } from "express";
import { generateFullNote } from "../services/aiService";
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
      saved = await prisma.note.create({
        data: {
          title: title ?? (synopsis?.slice(0, 60) ?? "Untitled"),
          synopsis: synopsis ?? "",
          content: noteMarkdown,
          authorId: authorId ?? undefined,
        },
      });
    }

    return res.json({ note: noteMarkdown, saved });
  } catch (err: any) {
    console.error("Generate note error:", err);
    return res.status(500).json({ error: err?.message ?? "Server error" });
  }
});

export default router;
