import { Router } from "express";
import { analyzeNote } from "../services/aiService.ts";

const router = Router();

// Route accepts partial or full draft: { title?, synopsis?, content }
router.post("/suggest", async (req, res) => {
  try {
    const data = req.body;

    if (!data.content) {
      return res.status(400).json({
        error: "Note content is required for AI generation",
      });
    }

    const result = await analyzeNote(data);
    return res.json(result);

  } catch (err) {
    console.error("AI Suggestion Error:", err);
    return res.status(500).json({ error: "AI processing failed" });
  }
});

export default router;
