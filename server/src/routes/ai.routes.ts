// src/routes/ai.routes.ts
import { Router } from "express";
import { analyzeNote } from "../services/aiService.ts";

const router = Router();

router.post("/suggest", async (req, res) => {
  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: "Note text is required" });
    }

    const result = await analyzeNote(note);

    return res.json(result);
  } catch (err) {
    console.error("AI Suggestion Error:", err);
    return res.status(500).json({ error: "AI processing failed" });
  }
});

export default router;
