import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "./../middleware/auth.ts";

const prisma = new PrismaClient();
const router = Router();

router.post("/ai/suggest-category", requireAuth, async (req, res) => {
  const { title, content } = req.body;

  const text = title + " " + content;

  // very simple classifier placeholder
  const categories = {
    productivity: ["habit", "routine", "focus", "workflow", "goal"],
    engineering: ["code", "server", "api", "debug", "testing"],
    design: ["ui", "ux", "color", "interface", "typography"],
    spiritual: ["prayer", "faith", "god", "soul"],
  };

  let best = "Uncategorized";

  for (const [cat, words] of Object.entries(categories)) {
    for (const w of words) {
      if (text.toLowerCase().includes(w)) {
        best = cat.charAt(0).toUpperCase() + cat.slice(1);
        break;
      }
    }
  }

  res.json({ category: best });
});
