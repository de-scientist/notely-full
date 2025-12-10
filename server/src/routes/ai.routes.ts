import { Router } from "express";
import { analyzeNote } from "../services/aiService.ts";

const router = Router();

// Route now expects the full draft object: { title, synopsis, content }
router.post("/suggest", async (req, res) => {
  try {
    const data = req.body;
    const { content } = data; // Destructure content for validation

    if (!content) {
      // The primary text (content) is required for analysis
      return res.status(400).json({ error: "Note content is required for AI suggestion" });
    }

    // Pass the entire structured data object to the service
    const result = await analyzeNote(data);

    return res.json(result);
  } catch (err) {
    console.error("AI Suggestion Error:", err);
    return res.status(500).json({ error: "AI processing failed" });
  }
});

export default router;